import { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceOrb } from './VoiceOrb';
import { VoiceSpeechRecognition } from '@/utils/SpeechRecognition';
import { VoiceTextToSpeech } from '@/utils/TextToSpeech';
import { useToast } from '@/hooks/use-toast';

interface VoiceInterfaceProps {
  onTranscript?: (text: string) => void;
  onUserMessage?: (text: string) => void;
  onAIResponse?: (text: string) => void;
}

type VoiceStatus = 'idle' | 'connecting' | 'listening' | 'processing' | 'speaking';

export const VoiceInterface = ({ onTranscript, onUserMessage, onAIResponse }: VoiceInterfaceProps) => {
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string, content: string}>>([]);
  const { toast } = useToast();

  // Use refs for values accessed in callbacks to avoid stale closures
  const statusRef = useRef<VoiceStatus>('idle');
  const recognitionRef = useRef<VoiceSpeechRecognition | null>(null);
  const ttsRef = useRef<VoiceTextToSpeech | null>(null);
  const isProcessingRef = useRef(false);
  const conversationHistoryRef = useRef(conversationHistory);

  // Sync refs
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    conversationHistoryRef.current = conversationHistory;
  }, [conversationHistory]);

  // Derived states for VoiceOrb
  const isConnected = status !== 'idle';
  const isListening = status === 'listening';
  const isSpeaking = status === 'speaking';

  useEffect(() => {
    // Check browser support
    if (!VoiceSpeechRecognition.isSupported()) {
      toast({
        title: 'Voice input not supported',
        description: 'Your browser does not support voice input. Please use Chrome or Edge.',
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
        recognitionRef.current?.resume();
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

    ttsRef.current?.stop();
  }, []);

  const processTranscript = useCallback(async (transcript: string) => {
    if (!transcript.trim() || isProcessingRef.current) {
      // Resume listening if empty transcript
      if (!transcript.trim()) {
        console.log('[VoiceInterface] Empty transcript, resuming listening');
        setStatus('listening');
        recognitionRef.current?.resume();
      }
      return;
    }

    console.log('[VoiceInterface] Processing transcript:', transcript);
    isProcessingRef.current = true;
    setStatus('processing');
    
    // Notify parent of user message
    onUserMessage?.(transcript);
    onTranscript?.(transcript);

    try {
      // Build conversation with history
      const newMessage = { role: 'user', content: transcript };
      const messagesToSend = [...conversationHistoryRef.current, newMessage];

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

      // Notify parent of AI response
      onAIResponse?.(fullResponse);

      // Speak the complete response
      if (fullResponse && ttsRef.current) {
        await ttsRef.current.speak(fullResponse);
      } else {
        // No response to speak, resume listening
        setStatus('listening');
        recognitionRef.current?.resume();
      }

    } catch (error) {
      console.error('[VoiceInterface] Error processing:', error);
      toast({
        title: 'AI Error',
        description: error instanceof Error ? error.message : 'Failed to get response',
        variant: 'destructive',
      });
      setStatus('listening');
      recognitionRef.current?.resume();
    } finally {
      isProcessingRef.current = false;
    }
  }, [onTranscript, onUserMessage, onAIResponse, toast]);

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

    setStatus('connecting');
    setCurrentTranscript('');

    try {
      // Initialize speech recognition with silence callback
      recognitionRef.current = new VoiceSpeechRecognition(
        // onTranscriptUpdate - update live display
        (transcript) => {
          console.log('[VoiceInterface] Live transcript:', transcript.substring(0, 30));
          setCurrentTranscript(transcript);
        },
        // onSilenceDetected - process when user stops speaking
        () => {
          console.log('[VoiceInterface] Silence detected, processing...');
          const transcript = recognitionRef.current?.finalizeTranscript() || '';
          if (transcript) {
            setCurrentTranscript(transcript);
            processTranscript(transcript);
          } else {
            console.log('[VoiceInterface] No transcript to process');
            recognitionRef.current?.resume();
          }
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
        },
        // config
        {
          silenceDuration: 1500  // 1.5 seconds of silence triggers processing
        }
      );

      // Start recognition - this will request mic permission internally
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
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <VoiceOrb
          isConnected={isConnected}
          isListening={isListening}
          isSpeaking={isSpeaking}
          onClick={handleOrbClick}
        />
      </div>

      {/* Status indicator */}
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-full px-4 py-1.5 text-sm text-muted-foreground">
        {getStatusText()}
      </div>

      {/* Current transcript - what user is saying */}
      {currentTranscript && (
        <div className="bg-primary/10 backdrop-blur-sm border border-primary/30 rounded-lg px-4 py-3 max-w-sm text-center">
          <p className="text-foreground font-medium text-lg">{currentTranscript}</p>
        </div>
      )}
    </div>
  );
};
