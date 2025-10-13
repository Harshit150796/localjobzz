export interface TextToSpeechConfig {
  language?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export class VoiceTextToSpeech {
  private synthesis: SpeechSynthesis;
  private isSpeaking = false;
  private config: Required<TextToSpeechConfig>;

  constructor(
    private onSpeakingChange?: (isSpeaking: boolean) => void,
    config: TextToSpeechConfig = {}
  ) {
    this.synthesis = window.speechSynthesis;
    this.config = {
      language: config.language ?? 'en-IN',
      rate: config.rate ?? 0.9,
      pitch: config.pitch ?? 1.0,
      volume: config.volume ?? 1.0,
    };
  }

  speak(text: string) {
    // Cancel any ongoing speech
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.config.language;
    utterance.rate = this.config.rate;
    utterance.pitch = this.config.pitch;
    utterance.volume = this.config.volume;

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (this.onSpeakingChange) {
        this.onSpeakingChange(true);
      }
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (this.onSpeakingChange) {
        this.onSpeakingChange(false);
      }
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      this.isSpeaking = false;
      if (this.onSpeakingChange) {
        this.onSpeakingChange(false);
      }
    };

    this.synthesis.speak(utterance);
  }

  stop() {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
      this.isSpeaking = false;
      if (this.onSpeakingChange) {
        this.onSpeakingChange(false);
      }
    }
  }

  isCurrentlySpeaking() {
    return this.isSpeaking;
  }

  static isSupported(): boolean {
    return 'speechSynthesis' in window;
  }
}
