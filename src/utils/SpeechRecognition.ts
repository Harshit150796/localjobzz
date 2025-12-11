export interface SpeechRecognitionConfig {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
}

export class VoiceSpeechRecognition {
  private recognition: any = null;
  private isListening = false;
  private accumulatedTranscript = '';      // From isFinal=true results
  private lastInterimTranscript = '';      // Latest interim results (backup)
  private hasSpeechEnded = false;          // Track browser's speechend event
  private onTranscriptUpdate: (transcript: string) => void;
  private onError: (error: string) => void;
  private onEnd: () => void;

  constructor(
    onTranscriptUpdate: (transcript: string) => void,
    onError: (error: string) => void,
    onEnd: () => void,
    config: SpeechRecognitionConfig = {}
  ) {
    this.onTranscriptUpdate = onTranscriptUpdate;
    this.onError = onError;
    this.onEnd = onEnd;

    // Check browser support
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      throw new Error('Speech recognition is not supported in this browser');
    }

    this.recognition = new SpeechRecognitionAPI();
    this.recognition.continuous = config.continuous ?? true;
    this.recognition.interimResults = config.interimResults ?? true;
    this.recognition.lang = config.language ?? 'en-IN';

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    if (!this.recognition) return;

    this.recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          // Final result - add to accumulated and clear interim
          this.accumulatedTranscript += transcript + ' ';
          this.lastInterimTranscript = '';
          console.log('[SpeechRecognition] Final result:', transcript.substring(0, 50));
        } else {
          // Interim result - store as backup
          this.lastInterimTranscript = transcript;
          console.log('[SpeechRecognition] Interim result:', transcript.substring(0, 50));
        }
      }

      // Display accumulated + interim for live feedback
      const currentDisplay = (this.accumulatedTranscript + this.lastInterimTranscript).trim();
      
      if (currentDisplay) {
        this.onTranscriptUpdate(currentDisplay);
      }
    };

    // Track when browser thinks speech has ended
    this.recognition.onspeechend = () => {
      console.log('[SpeechRecognition] Browser detected speech end');
      this.hasSpeechEnded = true;
    };

    this.recognition.onerror = (event: any) => {
      console.error('[SpeechRecognition] Error:', event.error);
      
      // Don't report no-speech as an error - it's normal
      if (event.error === 'no-speech') {
        return;
      }
      
      // Don't report aborted - it's intentional
      if (event.error === 'aborted') {
        return;
      }

      const errorMessages: Record<string, string> = {
        'network': 'Network error. Please check your connection.',
        'not-allowed': 'Microphone access denied. Please allow microphone access.',
        'audio-capture': 'No microphone detected.',
        'service-not-available': 'Speech service unavailable.',
      };

      this.onError(errorMessages[event.error] || `Speech recognition error: ${event.error}`);
    };

    this.recognition.onend = () => {
      console.log('[SpeechRecognition] Recognition ended, isListening:', this.isListening);
      
      // Auto-restart if we're still supposed to be listening
      if (this.isListening) {
        console.log('[SpeechRecognition] Auto-restarting...');
        try {
          this.recognition?.start();
        } catch (error) {
          console.error('[SpeechRecognition] Failed to restart:', error);
          this.isListening = false;
          this.onEnd();
        }
      } else {
        this.onEnd();
      }
    };
  }

  start(): void {
    if (!this.recognition) {
      this.onError('Speech recognition not initialized');
      return;
    }

    try {
      this.isListening = true;
      this.accumulatedTranscript = '';
      this.lastInterimTranscript = '';
      this.hasSpeechEnded = false;
      this.recognition.start();
      console.log('[SpeechRecognition] Started');
    } catch (error) {
      console.error('[SpeechRecognition] Failed to start:', error);
      this.isListening = false;
      this.onError('Failed to start speech recognition');
    }
  }

  stop(): void {
    console.log('[SpeechRecognition] Stopping...');
    this.isListening = false;
    
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.error('[SpeechRecognition] Error stopping:', error);
      }
    }
  }

  // Called by AudioLevelAnalyzer when silence is detected
  // Returns BOTH accumulated AND last interim (as fallback)
  finalizeTranscript(): string {
    const transcript = (this.accumulatedTranscript + this.lastInterimTranscript).trim();
    console.log('[SpeechRecognition] Finalizing transcript:', transcript || '(empty)');
    console.log('[SpeechRecognition] - Accumulated:', this.accumulatedTranscript || '(empty)');
    console.log('[SpeechRecognition] - Interim backup:', this.lastInterimTranscript || '(empty)');
    
    // Clear both
    this.accumulatedTranscript = '';
    this.lastInterimTranscript = '';
    this.hasSpeechEnded = false;
    
    return transcript;
  }

  // Check if we have any transcript available (for grace period logic)
  hasTranscript(): boolean {
    return (this.accumulatedTranscript + this.lastInterimTranscript).trim().length > 0;
  }

  // Get current transcript without clearing (for checking)
  getCurrentTranscript(): string {
    return (this.accumulatedTranscript + this.lastInterimTranscript).trim();
  }

  // Clear without returning - used when canceling
  clearTranscript(): void {
    this.accumulatedTranscript = '';
    this.lastInterimTranscript = '';
    this.hasSpeechEnded = false;
  }

  isActive(): boolean {
    return this.isListening;
  }

  didSpeechEnd(): boolean {
    return this.hasSpeechEnded;
  }

  static isSupported(): boolean {
    return !!(
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition
    );
  }
}
