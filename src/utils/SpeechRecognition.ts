export interface SpeechRecognitionConfig {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  maxAlternatives?: number;
}

export class VoiceSpeechRecognition {
  private recognition: any;
  private isListening = false;

  constructor(
    private onTranscript: (transcript: string, isFinal: boolean) => void,
    private onError?: (error: string) => void,
    private onEnd?: () => void,
    config: SpeechRecognitionConfig = {}
  ) {
    // Check browser compatibility
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      throw new Error('Speech recognition not supported in this browser');
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = config.continuous ?? true;
    this.recognition.interimResults = config.interimResults ?? true;
    this.recognition.lang = config.language ?? 'en-IN';
    this.recognition.maxAlternatives = config.maxAlternatives ?? 1;

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.recognition.onresult = (event: any) => {
      const results = Array.from(event.results);
      const lastResult = results[results.length - 1] as any;
      const transcript = lastResult[0].transcript;
      const isFinal = lastResult.isFinal;

      this.onTranscript(transcript, isFinal);
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      
      let errorMessage = 'Speech recognition error';
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'Microphone not found or not accessible.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone permission denied.';
          break;
        case 'network':
          errorMessage = 'Network error occurred.';
          break;
        default:
          errorMessage = `Recognition error: ${event.error}`;
      }

      if (this.onError) {
        this.onError(errorMessage);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onEnd) {
        this.onEnd();
      }
    };
  }

  start() {
    if (!this.isListening) {
      try {
        this.recognition.start();
        this.isListening = true;
      } catch (error) {
        console.error('Error starting recognition:', error);
        if (this.onError) {
          this.onError('Failed to start speech recognition');
        }
      }
    }
  }

  stop() {
    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  isActive() {
    return this.isListening;
  }

  static isSupported(): boolean {
    return !!(
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition
    );
  }
}
