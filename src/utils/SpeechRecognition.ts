export interface SpeechRecognitionConfig {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  maxAlternatives?: number;
  silenceTimeout?: number; // ms to wait before considering speech final
}

export class VoiceSpeechRecognition {
  private recognition: any;
  private isListening = false;
  private silenceTimer: NodeJS.Timeout | null = null;
  private accumulatedTranscript = '';
  private lastInterimTranscript = '';
  private config: Required<SpeechRecognitionConfig>;

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

    this.config = {
      continuous: config.continuous ?? true,
      interimResults: config.interimResults ?? true,
      language: config.language ?? 'en-IN',
      maxAlternatives: config.maxAlternatives ?? 1,
      silenceTimeout: config.silenceTimeout ?? 1500, // 1.5 seconds of silence = final
    };

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = this.config.continuous;
    this.recognition.interimResults = this.config.interimResults;
    this.recognition.lang = this.config.language;
    this.recognition.maxAlternatives = this.config.maxAlternatives;

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.recognition.onresult = (event: any) => {
      // Clear any pending silence timer
      this.clearSilenceTimer();

      let interimTranscript = '';
      let finalTranscript = '';

      // Process all results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;

        if (result.isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // If we have a final result from the recognition engine, use it immediately
      if (finalTranscript) {
        this.accumulatedTranscript = '';
        this.lastInterimTranscript = '';
        console.log('Recognition engine final:', finalTranscript);
        this.onTranscript(finalTranscript.trim(), true);
        return;
      }

      // For interim results, show them but don't process yet
      if (interimTranscript) {
        this.lastInterimTranscript = interimTranscript;
        // Show interim to user (but not marked as final)
        this.onTranscript(interimTranscript, false);

        // Start silence timer - if no more speech, consider this final
        this.startSilenceTimer();
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      
      // Clear timers on error
      this.clearSilenceTimer();
      
      let errorMessage = 'Speech recognition error';
      switch (event.error) {
        case 'no-speech':
          // This is common and not really an error, just restart
          console.log('No speech detected, will restart...');
          return; // Don't show error for this
        case 'audio-capture':
          errorMessage = 'Microphone not found or not accessible.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone permission denied.';
          break;
        case 'network':
          errorMessage = 'Network error occurred.';
          break;
        case 'aborted':
          // User or system aborted, not an error
          return;
        default:
          errorMessage = `Recognition error: ${event.error}`;
      }

      if (this.onError) {
        this.onError(errorMessage);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      
      // If we have pending interim transcript when recognition ends, finalize it
      if (this.lastInterimTranscript) {
        this.clearSilenceTimer();
        console.log('Finalizing on end:', this.lastInterimTranscript);
        this.onTranscript(this.lastInterimTranscript.trim(), true);
        this.lastInterimTranscript = '';
      }
      
      if (this.onEnd) {
        this.onEnd();
      }
    };

    this.recognition.onspeechend = () => {
      // Speech ended - start a shorter timer to finalize
      if (this.lastInterimTranscript) {
        this.startSilenceTimer(500); // Shorter timeout after speech ends
      }
    };
  }

  private startSilenceTimer(timeout?: number) {
    this.clearSilenceTimer();
    
    this.silenceTimer = setTimeout(() => {
      if (this.lastInterimTranscript) {
        console.log('Silence timer fired, finalizing:', this.lastInterimTranscript);
        const transcript = this.lastInterimTranscript;
        this.lastInterimTranscript = '';
        this.onTranscript(transcript.trim(), true);
      }
    }, timeout ?? this.config.silenceTimeout);
  }

  private clearSilenceTimer() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  start() {
    if (!this.isListening) {
      try {
        // Reset state
        this.accumulatedTranscript = '';
        this.lastInterimTranscript = '';
        this.clearSilenceTimer();
        
        this.recognition.start();
        this.isListening = true;
        console.log('Speech recognition started');
      } catch (error) {
        console.error('Error starting recognition:', error);
        if (this.onError) {
          this.onError('Failed to start speech recognition');
        }
      }
    }
  }

  stop() {
    this.clearSilenceTimer();
    
    if (this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignore errors when stopping
      }
      this.isListening = false;
    }
    
    // Clear any pending transcript
    this.lastInterimTranscript = '';
    this.accumulatedTranscript = '';
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
