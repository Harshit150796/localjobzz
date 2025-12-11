/**
 * Simple timer-based silence detection.
 * Triggers callback after N ms of no new transcript activity.
 * Works alongside SpeechRecognition without mic conflicts.
 */
export class SilenceTimer {
  private timeout: NodeJS.Timeout | null = null;
  private silenceDuration: number;
  private onSilenceDetected: () => void;
  private isActive = false;

  constructor(silenceDuration: number, onSilenceDetected: () => void) {
    this.silenceDuration = silenceDuration;
    this.onSilenceDetected = onSilenceDetected;
  }

  // Call this whenever new transcript activity is received
  activity(): void {
    if (!this.isActive) return;
    
    // Reset the timer
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    
    this.timeout = setTimeout(() => {
      console.log('[SilenceTimer] Silence detected after', this.silenceDuration, 'ms');
      this.onSilenceDetected();
    }, this.silenceDuration);
  }

  start(): void {
    console.log('[SilenceTimer] Started with duration:', this.silenceDuration, 'ms');
    this.isActive = true;
    // Don't start timer immediately - wait for first activity
  }

  stop(): void {
    console.log('[SilenceTimer] Stopped');
    this.isActive = false;
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

  pause(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

  resume(): void {
    // Resume will wait for next activity
    this.isActive = true;
  }

  reset(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }
}
