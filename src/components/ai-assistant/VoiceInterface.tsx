import { useState, useEffect, useRef } from 'react';
import { VoiceOrb } from './VoiceOrb';
import { AudioVisualizer } from './AudioVisualizer';
import { VoiceSpeechRecognition } from '@/utils/SpeechRecognition';
import { VoiceTextToSpeech } from '@/utils/TextToSpeech';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VoiceInterfaceProps {
  onTranscript?: (text: string) => void;
}

export const VoiceInterface = ({ onTranscript }: VoiceInterfaceProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string, content: string}>>([]);
  const { toast } = useToast();

  const recognitionRef = useRef<VoiceSpeechRecognition | null>(null);
  const ttsRef = useRef<VoiceTextToSpeech | null>(null);

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

    // Initialize Text-to-Speech
    ttsRef.current = new VoiceTextToSpeech((speaking) => {
      setIsSpeaking(speaking);
    });

    return () => {
      recognitionRef.current?.stop();
      ttsRef.current?.stop();
    };
  }, []);

  const startVoiceChat = async () => {
    try {
      // Initialize Speech Recognition
      recognitionRef.current = new VoiceSpeechRecognition(
        async (transcript, isFinal) => {
          setCurrentTranscript(transcript);

          if (isFinal) {
            console.log('Final transcript:', transcript);
            
            // Notify parent component
            if (onTranscript) {
              onTranscript(transcript);
            }

            // Send to AI assistant
            await processTranscript(transcript);
            
            // Clear transcript
            setCurrentTranscript('');
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
          // On end - restart if still connected
          if (isConnected && recognitionRef.current) {
            setTimeout(() => {
              if (isConnected) {
                recognitionRef.current?.start();
              }
            }, 100);
          }
        }
      );

      recognitionRef.current.start();
      setIsListening(true);
      setIsConnected(true);

      toast({
        title: 'Voice chat started',
        description: 'Listening for your command...',
      });
    } catch (error) {
      console.error('Error starting voice chat:', error);
      toast({
        title: 'Failed to start',
        description: error instanceof Error ? error.message : 'Could not start voice chat',
        variant: 'destructive',
      });
    }
  };

  const processTranscript = async (transcript: string) => {
    try {
      setIsListening(false);
      
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

      if (!response.ok || !response.body) throw new Error('Failed to get AI response');

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
              // Let AI narrate the jobs
            } else if (parsed.tool_result === 'job_details') {
              // Job details will be narrated by the AI
              const job = parsed.job;
              console.log('Got job details:', job);
            } else if (parsed.error) {
              console.error('AI Error:', parsed.error);
              toast({
                title: 'AI Error',
                description: parsed.error,
                variant: 'destructive',
              });
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
        ttsRef.current.speak(fullResponse);
      }

      // Show jobs found
      if (jobsFound.length > 0 && onTranscript) {
        onTranscript(JSON.stringify({ found: jobsFound.length, jobs: jobsFound }, null, 2));
      }

      // Resume listening
      setTimeout(() => {
        if (isConnected) setIsListening(true);
      }, 500);

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'AI Error',
        description: error instanceof Error ? error.message : 'Failed',
        variant: 'destructive',
      });
      setIsListening(true);
    }
  };

  const endVoiceChat = () => {
    recognitionRef.current?.stop();
    ttsRef.current?.stop();
    setIsConnected(false);
    setIsListening(false);
    setIsSpeaking(false);
    setCurrentTranscript('');

    toast({
      title: 'Voice chat ended',
    });
  };

  const handleOrbClick = () => {
    if (isConnected) {
      endVoiceChat();
    } else {
      startVoiceChat();
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

      {currentTranscript && (
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg px-4 py-2 max-w-md">
          <p className="text-sm text-muted-foreground">You're saying:</p>
          <p className="text-foreground">{currentTranscript}</p>
        </div>
      )}
    </div>
  );
};
