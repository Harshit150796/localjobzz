import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AudioRecorder, encodeAudioForAPI } from '@/utils/VoiceRecorder';
import { AudioQueue } from '@/utils/AudioQueue';
import { VoiceOrb } from './VoiceOrb';
import { AudioVisualizer } from './AudioVisualizer';

interface VoiceInterfaceProps {
  onTranscript?: (text: string) => void;
}

export const VoiceInterface = ({ onTranscript }: VoiceInterfaceProps) => {
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
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      audioQueueRef.current = new AudioQueue(audioContextRef.current);

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

  const handleOrbClick = () => {
    if (isConnected) {
      endVoiceChat();
    } else {
      startVoiceChat();
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      <VoiceOrb
        isConnected={isConnected}
        isListening={isRecording && !isSpeaking}
        isSpeaking={isSpeaking}
        onClick={handleOrbClick}
      />
      <AudioVisualizer isActive={isConnected} isSpeaking={isSpeaking} />
    </div>
  );
};
