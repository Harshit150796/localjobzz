import { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceOrb } from './VoiceOrb';
import { AudioVisualizer } from './AudioVisualizer';
import { VoiceSpeechRecognition } from '@/utils/SpeechRecognition';
import { VoiceTextToSpeech } from '@/utils/TextToSpeech';
import { useToast } from '@/hooks/use-toast';

interface VoiceInterfaceProps {
  onTranscript?: (text: string) => void;
}

type VoiceStatus = 'idle' | 'connecting' | 'listening' | 'processing' | 'speaking';

export const VoiceInterface = ({ onTranscript }: VoiceInterfaceProps) => {
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string, content: string}>>([]);
  const { toast } = useToast();

  // Use refs for values accessed in callbacks to avoid stale closures
  const statusRef = useRef<VoiceStatus>('idle');
  const recognitionRef = useRef<VoiceSpeechRecognition | null>(null);
  const ttsRef = useRef<VoiceTextToSpeech | null>(null);
  const isProcessingRef = useRef(false);

  // Sync status to ref
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Derived states for VoiceOrb
  const isConnected = status !== 'idle';
  const isListening = status === 'listening';
  const isSpeaking = status === 'speaking';

  useEffect(() => {
    // Check browser support
    if (!VoiceSpeechRecognition.isSupported()) {
      toast({
        title: 'Voice input not supported',
        description: 'Your browser does not support voice input. Please use text mode.',
        variant: 'destructive',
      });
      return;
    }

    if (!VoiceTextToSpeech.isSupported()) {
      toast({
        title: 'Voice output not supported',
        description: 'Your browser does not support voice output.',
        variant: 'destructive',
      });
    }

    // Initialize Text-to-Speech with speaking state callback
    ttsRef.current = new VoiceTextToSpeech((speaking) => {
      if (speaking) {
        setStatus('speaking');
      } else if (statusRef.current === 'speaking') {
        // TTS finished, restart listening if still connected
        restartListening();
      }
    });

    return () => {
      recognitionRef.current?.stop();
      ttsRef.current?.stop();
    };
  }, []);

  const restartListening = useCallback(() => {
    if (statusRef.current !== 'idle' && !isProcessingRef.current) {
      console.log('Restarting listening...');
      setStatus('listening');
      setTimeout(() => {
        if (statusRef.current === 'listening' && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.error('Error restarting recognition:', e);
          }
        }
      }, 200);
    }
  }, []);

  const processTranscript = useCallback(async (transcript: string) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      setStatus('processing');
      
      // Stop recognition while processing
      recognitionRef.current?.stop();
      
      // Build conversation with history
      const newMessage = { role: 'user', content: transcript };
      const messagesToSend = [...conversationHistory, newMessage];

      const response = await fetch(
        'https://fztiznsyknofxoplyirz.supabase.co/functions/v1/ai-job-assistant',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6dGl6bnN5a25vZnhvcGx5aXJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MDM3OTUsImV4cCI6MjA3NDE3OTc5NX0.Vz_qhPD2YkH1vnirQka1SkFPYq0VkzUTgoj9KC7fZcY`,
          },
          body: JSON.stringify({ messages: messagesToSend }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error('Failed to get AI response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullResponse = '';
      let jobsFound: any[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            
            // Handle tool results
            if (parsed.tool_result === 'jobs_found') {
              jobsFound = parsed.jobs || [];
            } else if (parsed.tool_result === 'job_details') {
              const job = parsed.job;
              console.log('Got job details:', job);
            } else if (parsed.error) {
              console.error('AI Error:', parsed.error);
            }
            
            // Handle regular content
            if (parsed.choices?.[0]?.delta?.content) {
              fullResponse += parsed.choices[0].delta.content;
            }
          } catch (e) {
            console.error('Parse error:', e);
          }
        }
      }

      // Update conversation history
      setConversationHistory([
        ...messagesToSend,
        { role: 'assistant', content: fullResponse }
      ]);

      // Speak the complete response
      if (fullResponse && ttsRef.current) {
        console.log('Speaking response:', fullResponse.substring(0, 50) + '...');
        await ttsRef.current.speak(fullResponse);
      } else {
        // No response to speak, restart listening
        restartListening();
      }

      // Show jobs found
      if (jobsFound.length > 0 && onTranscript) {
        onTranscript(JSON.stringify({ found: jobsFound.length, jobs: jobsFound }, null, 2));
      }

    } catch (error) {
      console.error('Error processing transcript:', error);
      toast({
        title: 'AI Error',
        description: error instanceof Error ? error.message : 'Failed to get response',
        variant: 'destructive',
      });
      restartListening();
    } finally {
      isProcessingRef.current = false;
    }
  }, [conversationHistory, onTranscript, restartListening, toast]);

  const startVoiceChat = async () => {
    try {
      setStatus('connecting');

      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Initialize Speech Recognition
      recognitionRef.current = new VoiceSpeechRecognition(
        async (transcript, isFinal) => {
          if (isFinal) {
            console.log('Final transcript received:', transcript);
            setCurrentTranscript('');
            
            // Notify parent component
            if (onTranscript) {
              onTranscript(transcript);
            }

            // Process with AI
            processTranscript(transcript);
          } else {
            // Show interim transcript
            setCurrentTranscript(transcript);
          }
        },
        (error) => {
          console.error('Speech recognition error:', error);
          toast({
            title: 'Voice input error',
            description: error,
            variant: 'destructive',
          });
        },
        () => {
          // On end - restart if still connected and not processing
          console.log('Recognition ended, status:', statusRef.current);
          if (statusRef.current === 'listening' && !isProcessingRef.current) {
            setTimeout(() => {
              if (statusRef.current === 'listening') {
                try {
                  recognitionRef.current?.start();
                } catch (e) {
                  console.error('Error restarting:', e);
                }
              }
            }, 300);
          }
        }
      );

      recognitionRef.current.start();
      setStatus('listening');

      toast({
        title: 'Voice chat started',
        description: 'Listening for your command...',
      });
    } catch (error) {
      console.error('Error starting voice chat:', error);
      setStatus('idle');
      toast({
        title: 'Failed to start',
        description: error instanceof Error ? error.message : 'Could not start voice chat',
        variant: 'destructive',
      });
    }
  };

  const endVoiceChat = () => {
    recognitionRef.current?.stop();
    ttsRef.current?.stop();
    setStatus('idle');
    setCurrentTranscript('');
    isProcessingRef.current = false;

    toast({
      title: 'Voice chat ended',
    });
  };

  const handleOrbClick = () => {
    if (status === 'idle') {
      startVoiceChat();
    } else {
      endVoiceChat();
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connecting':
        return 'Connecting...';
      case 'listening':
        return 'Listening...';
      case 'processing':
        return 'Thinking...';
      case 'speaking':
        return 'Speaking...';
      default:
        return 'Tap to start';
    }
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-50">
      <div className="relative">
        <VoiceOrb
          isConnected={isConnected}
          isListening={isListening}
          isSpeaking={isSpeaking}
          onClick={handleOrbClick}
        />
        <AudioVisualizer 
          isActive={isConnected && (isListening || isSpeaking)} 
          isSpeaking={isSpeaking}
        />
      </div>

      {/* Status indicator */}
      {status !== 'idle' && (
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-full px-4 py-1.5 text-sm text-muted-foreground">
          {getStatusText()}
        </div>
      )}

      {/* Current transcript */}
      {currentTranscript && status === 'listening' && (
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg px-4 py-2 max-w-md">
          <p className="text-sm text-muted-foreground">You're saying:</p>
          <p className="text-foreground">{currentTranscript}</p>
        </div>
      )}
    </div>
  );
};
