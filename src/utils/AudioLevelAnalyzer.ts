export interface AudioLevelAnalyzerConfig {
  silenceThreshold?: number;  // RMS threshold (0-1), default 0.015
  silenceDuration?: number;   // ms of silence before triggering, default 1500
  minSpeechDuration?: number; // minimum ms of speech before allowing silence detection, default 300
  gracePeriod?: number;       // ms to wait after silence for transcript to finalize, default 200
}

export interface AudioLevelCallbacks {
  onSilenceDetected: () => void;
  onSpeechDetected?: () => void;
  onAudioLevel?: (level: number) => void;
  hasTranscript?: () => boolean;  // Check if transcript is available before triggering
}

export class AudioLevelAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private animationFrame: number | null = null;
  private isRunning = false;
  private isPaused = false;
  
  // Configuration
  private silenceThreshold: number;
  private silenceDuration: number;
  private minSpeechDuration: number;
  private gracePeriod: number;
  
  // State
  private silenceStart: number | null = null;
  private speechStart: number | null = null;
  private hasSpeechStarted = false;
  private callbacks: AudioLevelCallbacks | null = null;
  private graceTimeout: NodeJS.Timeout | null = null;

  constructor(config: AudioLevelAnalyzerConfig = {}) {
    this.silenceThreshold = config.silenceThreshold ?? 0.015;
    this.silenceDuration = config.silenceDuration ?? 1500;
    this.minSpeechDuration = config.minSpeechDuration ?? 300;
    this.gracePeriod = config.gracePeriod ?? 200;
  }

  async start(stream: MediaStream, callbacks: AudioLevelCallbacks): Promise<void> {
    try {
      this.callbacks = callbacks;
      this.isRunning = true;
      this.isPaused = false;
      this.hasSpeechStarted = false;
      this.silenceStart = null;
      this.speechStart = null;

      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.3;

      // Connect stream to analyser
      this.source = this.audioContext.createMediaStreamSource(stream);
      this.source.connect(this.analyser);

      // Start detection loop
      this.detectSilence();
      
      console.log('[AudioLevelAnalyzer] Started with threshold:', this.silenceThreshold, 'grace period:', this.gracePeriod);
    } catch (error) {
      console.error('[AudioLevelAnalyzer] Failed to start:', error);
      throw error;
    }
  }

  private calculateRMS(dataArray: Uint8Array): number {
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      // Normalize byte value (0-255) to -1 to 1
      const normalized = (dataArray[i] - 128) / 128;
      sum += normalized * normalized;
    }
    return Math.sqrt(sum / dataArray.length);
  }

  private detectSilence = (): void => {
    if (!this.isRunning || !this.analyser) return;

    if (this.isPaused) {
      this.animationFrame = requestAnimationFrame(this.detectSilence);
      return;
    }

    const dataArray = new Uint8Array(this.analyser.fftSize);
    this.analyser.getByteTimeDomainData(dataArray);

    const rms = this.calculateRMS(dataArray);
    const now = performance.now();

    // Report audio level for visualization
    this.callbacks?.onAudioLevel?.(rms);

    if (rms >= this.silenceThreshold) {
      // Speech detected
      if (!this.hasSpeechStarted) {
        this.speechStart = now;
        this.hasSpeechStarted = true;
        console.log('[AudioLevelAnalyzer] Speech started');
      }
      
      // Reset silence timer when speech detected
      if (this.silenceStart !== null) {
        this.silenceStart = null;
        this.callbacks?.onSpeechDetected?.();
      }

      // Clear any pending grace timeout
      if (this.graceTimeout) {
        clearTimeout(this.graceTimeout);
        this.graceTimeout = null;
      }
    } else {
      // Below threshold - might be silence
      // Only start counting silence after minimum speech duration
      if (this.hasSpeechStarted && this.speechStart) {
        const speechDuration = now - this.speechStart;
        
        if (speechDuration >= this.minSpeechDuration) {
          if (this.silenceStart === null) {
            this.silenceStart = now;
            console.log('[AudioLevelAnalyzer] Silence started after', Math.round(speechDuration), 'ms of speech');
          } else {
            const silenceDuration = now - this.silenceStart;
            
            if (silenceDuration >= this.silenceDuration) {
              console.log('[AudioLevelAnalyzer] Silence detected for', Math.round(silenceDuration), 'ms');
              
              // Pause detection to prevent multiple triggers
              this.isPaused = true;
              this.hasSpeechStarted = false;
              this.silenceStart = null;
              this.speechStart = null;

              // Use grace period to let speech recognition catch up
              this.graceTimeout = setTimeout(() => {
                console.log('[AudioLevelAnalyzer] Grace period elapsed, checking for transcript');
                
                // Check if transcript is available before triggering
                const hasContent = this.callbacks?.hasTranscript?.() ?? true;
                
                if (hasContent) {
                  console.log('[AudioLevelAnalyzer] Transcript available, triggering callback');
                  this.callbacks?.onSilenceDetected();
                } else {
                  console.log('[AudioLevelAnalyzer] No transcript yet, resuming listening');
                  this.resume();
                }
              }, this.gracePeriod);

              return;
            }
          }
        }
      }
    }

    this.animationFrame = requestAnimationFrame(this.detectSilence);
  };

  resume(): void {
    if (!this.isRunning) return;
    
    console.log('[AudioLevelAnalyzer] Resuming detection');
    
    // Clear any pending grace timeout
    if (this.graceTimeout) {
      clearTimeout(this.graceTimeout);
      this.graceTimeout = null;
    }
    
    this.isPaused = false;
    this.hasSpeechStarted = false;
    this.silenceStart = null;
    this.speechStart = null;
    
    // Restart detection loop if it stopped
    if (this.animationFrame === null) {
      this.detectSilence();
    }
  }

  pause(): void {
    console.log('[AudioLevelAnalyzer] Pausing detection');
    this.isPaused = true;
  }

  stop(): void {
    console.log('[AudioLevelAnalyzer] Stopping');
    this.isRunning = false;
    this.isPaused = false;

    // Clear grace timeout
    if (this.graceTimeout) {
      clearTimeout(this.graceTimeout);
      this.graceTimeout = null;
    }
    
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }

    if (this.audioContext) {
      this.audioContext.close().catch(console.error);
      this.audioContext = null;
    }

    this.analyser = null;
    this.callbacks = null;
  }

  isActive(): boolean {
    return this.isRunning && !this.isPaused;
  }

  static isSupported(): boolean {
    return !!(window.AudioContext || (window as any).webkitAudioContext);
  }
}
