import { SilenceTimer } from './SilenceTimer';

export interface SpeechRecognitionConfig {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  silenceDuration?: number;  // ms of silence before triggering callback
}

export class VoiceSpeechRecognition {
  private recognition: any = null;
  private isListening = false;
  private accumulatedTranscript = '';      // From isFinal=true results
  private lastInterimTranscript = '';      // Latest interim results (backup)
  private silenceTimer: SilenceTimer | null = null;
  private onTranscriptUpdate: (transcript: string) => void;
  private onSilenceDetected: () => void;
  private onError: (error: string) => void;
  private onEnd: () => void;

  constructor(
    onTranscriptUpdate: (transcript: string) => void,
    onSilenceDetected: () => void,
    onError: (error: string) => void,
    onEnd: () => void,
    config: SpeechRecognitionConfig = {}
  ) {
    this.onTranscriptUpdate = onTranscriptUpdate;
    this.onSilenceDetected = onSilenceDetected;
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

    // Create silence timer - triggers when user stops speaking
    const silenceDuration = config.silenceDuration ?? 1500;
    this.silenceTimer = new SilenceTimer(silenceDuration, () => {
      this.handleSilenceDetected();
    });

    this.setupEventHandlers();
  }

  private handleSilenceDetected(): void {
    console.log('[SpeechRecognition] Silence timer triggered');
    
    // Pause the timer to prevent multiple triggers
    this.silenceTimer?.pause();
    
    // Get the best available transcript
    const transcript = this.getCurrentTranscript();
    
    if (transcript) {
      console.log('[SpeechRecognition] Processing transcript:', transcript.substring(0, 50));
      this.onSilenceDetected();
    } else {
      console.log('[SpeechRecognition] No transcript available, resuming');
      this.silenceTimer?.resume();
    }
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
        }
      }

      // Display accumulated + interim for live feedback
      const currentDisplay = this.getCurrentTranscript();
      
      if (currentDisplay) {
        this.onTranscriptUpdate(currentDisplay);
        // Reset silence timer - user is still speaking
        this.silenceTimer?.activity();
      }
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
      this.recognition.start();
      this.silenceTimer?.start();
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
    this.silenceTimer?.stop();
    
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.error('[SpeechRecognition] Error stopping:', error);
      }
    }
  }

  // Get the best available transcript without clearing
  getCurrentTranscript(): string {
    return (this.accumulatedTranscript + this.lastInterimTranscript).trim();
  }

  // Called when processing starts - returns transcript and clears state
  finalizeTranscript(): string {
    const transcript = this.getCurrentTranscript();
    console.log('[SpeechRecognition] Finalizing transcript:', transcript || '(empty)');
    
    // Clear both
    this.accumulatedTranscript = '';
    this.lastInterimTranscript = '';
    
    return transcript;
  }

  // Check if we have any transcript available
  hasTranscript(): boolean {
    return this.getCurrentTranscript().length > 0;
  }

  // Clear without returning - used when canceling
  clearTranscript(): void {
    this.accumulatedTranscript = '';
    this.lastInterimTranscript = '';
  }

  // Resume listening after processing
  resume(): void {
    console.log('[SpeechRecognition] Resuming...');
    this.clearTranscript();
    this.silenceTimer?.resume();
  }

  isActive(): boolean {
    return this.isListening;
  }

  static isSupported(): boolean {
    return !!(
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition
    );
  }
}
