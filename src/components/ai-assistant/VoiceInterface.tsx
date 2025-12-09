import { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceOrb } from './VoiceOrb';
import { AudioVisualizer } from './AudioVisualizer';
import { VoiceSpeechRecognition } from '@/utils/SpeechRecognition';
import { VoiceTextToSpeech } from '@/utils/TextToSpeech';
import { AudioLevelAnalyzer } from '@/utils/AudioLevelAnalyzer';
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
  const audioAnalyzerRef = useRef<AudioLevelAnalyzer | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
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
        // TTS finished, resume listening
        console.log('[VoiceInterface] TTS finished, resuming listening');
        setStatus('listening');
        setCurrentTranscript('');
        audioAnalyzerRef.current?.resume();
      }
    });

    return () => {
      cleanup();
    };
  }, []);

  const cleanup = useCallback(() => {
    console.log('[VoiceInterface] Cleaning up...');
    
    recognitionRef.current?.stop();
    recognitionRef.current = null;

    audioAnalyzerRef.current?.stop();
    audioAnalyzerRef.current = null;

    ttsRef.current?.stop();

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const processTranscript = useCallback(async (transcript: string) => {
    if (!transcript.trim() || isProcessingRef.current) {
      // Resume listening if empty transcript
      if (!transcript.trim()) {
        console.log('[VoiceInterface] Empty transcript, resuming listening');
        setStatus('listening');
        audioAnalyzerRef.current?.resume();
      }
      return;
    }

    console.log('[VoiceInterface] Processing transcript:', transcript);
    isProcessingRef.current = true;
    setStatus('processing');
    
    // Notify parent
    onTranscript?.(transcript);

    try {
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
              console.log('Got job details:', parsed.job);
            } else if (parsed.error) {
              console.error('AI Error:', parsed.error);
            }
            
            // Handle regular content
            if (parsed.choices?.[0]?.delta?.content) {
              fullResponse += parsed.choices[0].delta.content;
            }
          } catch (e) {
            // Ignore parse errors for incomplete chunks
          }
        }
      }

      // Update conversation history
      setConversationHistory([
        ...messagesToSend,
        { role: 'assistant', content: fullResponse }
      ]);

      console.log('[VoiceInterface] AI response:', fullResponse.substring(0, 100) + '...');

      // Speak the complete response
      if (fullResponse && ttsRef.current) {
        await ttsRef.current.speak(fullResponse);
      } else {
        // No response to speak, resume listening
        setStatus('listening');
        audioAnalyzerRef.current?.resume();
      }

      // Show jobs found
      if (jobsFound.length > 0 && onTranscript) {
        onTranscript(JSON.stringify({ found: jobsFound.length, jobs: jobsFound }, null, 2));
      }

    } catch (error) {
      console.error('[VoiceInterface] Error processing:', error);
      toast({
        title: 'AI Error',
        description: error instanceof Error ? error.message : 'Failed to get response',
        variant: 'destructive',
      });
      setStatus('listening');
      audioAnalyzerRef.current?.resume();
    } finally {
      isProcessingRef.current = false;
    }
  }, [conversationHistory, onTranscript, toast]);

  const startVoiceChat = async () => {
    // Check browser support
    if (!VoiceSpeechRecognition.isSupported()) {
      toast({
        title: 'Not supported',
        description: 'Speech recognition is not supported in your browser. Please use Chrome or Edge.',
        variant: 'destructive',
      });
      return;
    }

    if (!AudioLevelAnalyzer.isSupported()) {
      toast({
        title: 'Not supported',
        description: 'Audio analysis is not supported in your browser.',
        variant: 'destructive',
      });
      return;
    }

    setStatus('connecting');
    setCurrentTranscript('');

    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      streamRef.current = stream;

      // Initialize speech recognition
      recognitionRef.current = new VoiceSpeechRecognition(
        // onTranscriptUpdate - just update display
        (transcript) => {
          setCurrentTranscript(transcript);
        },
        // onError
        (error) => {
          console.error('[VoiceInterface] Recognition error:', error);
          toast({
            title: 'Voice input error',
            description: error,
            variant: 'destructive',
          });
        },
        // onEnd
        () => {
          console.log('[VoiceInterface] Recognition ended');
        }
      );

      // Initialize audio level analyzer for silence detection
      audioAnalyzerRef.current = new AudioLevelAnalyzer({
        silenceThreshold: 0.015,
        silenceDuration: 1500,
        minSpeechDuration: 300
      });

      await audioAnalyzerRef.current.start(stream, {
        onSilenceDetected: () => {
          console.log('[VoiceInterface] Silence detected by analyzer');
          
          // Get the accumulated transcript
          const transcript = recognitionRef.current?.finalizeTranscript() || '';
          
          if (transcript) {
            processTranscript(transcript);
          } else {
            // No transcript - just resume listening
            console.log('[VoiceInterface] No transcript, resuming listening');
            audioAnalyzerRef.current?.resume();
          }
        },
        onSpeechDetected: () => {
          // User started speaking again
        }
      });

      // Start recognition
      recognitionRef.current.start();
      setStatus('listening');

      toast({
        title: 'Voice chat started',
        description: 'Speak now... I\'ll process when you pause.',
      });

      console.log('[VoiceInterface] Voice chat started successfully');
    } catch (error: any) {
      console.error('[VoiceInterface] Failed to start:', error);
      
      if (error.name === 'NotAllowedError') {
        toast({
          title: 'Microphone access denied',
          description: 'Please allow microphone access to use voice chat.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Failed to start',
          description: error.message || 'Could not start voice chat',
          variant: 'destructive',
        });
      }
      
      setStatus('idle');
      cleanup();
    }
  };

  const endVoiceChat = () => {
    console.log('[VoiceInterface] Ending voice chat');
    cleanup();
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
        return 'Starting...';
      case 'listening':
        return currentTranscript ? 'Listening...' : 'Speak now...';
      case 'processing':
        return 'Processing...';
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
