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
      // Stop listening while processing
      setIsListening(false);

      console.log('Sending to AI:', transcript);

      // Call the existing ai-job-assistant edge function
      const { data, error } = await supabase.functions.invoke('ai-job-assistant', {
        body: { 
          messages: [
            { role: 'user', content: transcript }
          ]
        },
      });

      if (error) throw error;

      console.log('AI response:', data);

      // Extract text response
      let responseText = '';
      if (data.response) {
        responseText = data.response;
      } else if (data.content) {
        responseText = data.content;
      } else if (typeof data === 'string') {
        responseText = data;
      }

      // Speak the response
      if (responseText && ttsRef.current) {
        ttsRef.current.speak(responseText);
      }

      // Resume listening after speaking
      setTimeout(() => {
        if (isConnected) {
          setIsListening(true);
        }
      }, 500);

    } catch (error) {
      console.error('Error processing transcript:', error);
      toast({
        title: 'AI Error',
        description: error instanceof Error ? error.message : 'Failed to process your request',
        variant: 'destructive',
      });

      // Resume listening
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
