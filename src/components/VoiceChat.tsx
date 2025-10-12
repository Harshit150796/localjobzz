import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AudioRecorder, encodeAudioForAPI } from '@/utils/VoiceRecorder';
import { AudioQueue } from '@/utils/AudioQueue';

interface VoiceChatProps {
  onTranscript?: (text: string) => void;
}

export const VoiceChat = ({ onTranscript }: VoiceChatProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();
  
  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioQueueRef = useRef<AudioQueue | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentTranscriptRef = useRef<string>('');

  const startVoiceChat = async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Initialize audio context and queue
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      audioQueueRef.current = new AudioQueue(audioContextRef.current);

      // Connect to WebSocket
      const ws = new WebSocket('wss://fztiznsyknofxoplyirz.supabase.co/functions/v1/ai-voice-assistant');
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        toast({
          title: "Voice chat started",
          description: "Start speaking to the AI assistant",
        });
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received event:', data.type);

          if (data.type === 'session.created') {
            console.log('Session created, starting recording');
            startRecording();
          } else if (data.type === 'response.audio.delta') {
            setIsSpeaking(true);
            const binaryString = atob(data.delta);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            await audioQueueRef.current?.addToQueue(bytes);
          } else if (data.type === 'response.audio.done') {
            setIsSpeaking(false);
          } else if (data.type === 'conversation.item.input_audio_transcription.completed') {
            console.log('User said:', data.transcript);
            if (onTranscript) {
              onTranscript(`User: ${data.transcript}`);
            }
          } else if (data.type === 'response.audio_transcript.delta') {
            currentTranscriptRef.current += data.delta;
          } else if (data.type === 'response.audio_transcript.done') {
            if (onTranscript && currentTranscriptRef.current) {
              onTranscript(`AI: ${currentTranscriptRef.current}`);
              currentTranscriptRef.current = '';
            }
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: "Connection error",
          description: "Failed to connect to voice assistant",
          variant: "destructive",
        });
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
        setIsConnected(false);
        setIsRecording(false);
        setIsSpeaking(false);
        stopRecording();
      };

    } catch (error) {
      console.error('Error starting voice chat:', error);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to use voice chat",
        variant: "destructive",
      });
    }
  };

  const startRecording = async () => {
    try {
      recorderRef.current = new AudioRecorder((audioData) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const encoded = encodeAudioForAPI(audioData);
          wsRef.current.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: encoded
          }));
        }
      });
      await recorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setIsRecording(false);
  };

  const endVoiceChat = () => {
    stopRecording();
    audioQueueRef.current?.clear();
    audioContextRef.current?.close();
    wsRef.current?.close();
    wsRef.current = null;
    setIsConnected(false);
    setIsSpeaking(false);
    toast({
      title: "Voice chat ended",
    });
  };

  useEffect(() => {
    return () => {
      endVoiceChat();
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      {!isConnected ? (
        <Button
          onClick={startVoiceChat}
          size="lg"
          className="rounded-full w-20 h-20 bg-primary hover:bg-primary/90"
        >
          <Mic className="w-8 h-8" />
        </Button>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Button
              onClick={endVoiceChat}
              size="lg"
              className="rounded-full w-20 h-20 bg-destructive hover:bg-destructive/90"
            >
              <MicOff className="w-8 h-8" />
            </Button>
            {isSpeaking && (
              <div className="absolute -top-2 -right-2 bg-primary rounded-full p-2 animate-pulse">
                <Volume2 className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-center gap-2">
            {isRecording && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                <span className="text-sm text-muted-foreground">Listening...</span>
              </div>
            )}
            {isSpeaking && (
              <span className="text-sm text-primary font-medium">AI is speaking...</span>
            )}
          </div>
        </div>
      )}
      
      <p className="text-center text-sm text-muted-foreground max-w-md">
        {!isConnected 
          ? "Click to start voice conversation with AI assistant" 
          : "Speak naturally to post jobs or find work. End call to stop."}
      </p>
    </div>
  );
};
