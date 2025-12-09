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
  private speechQueue: string[] = [];
  private isProcessingQueue = false;
  private voicesLoaded = false;

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
    
    // Wait for voices to load
    this.loadVoices();
  }

  private loadVoices(): Promise<void> {
    return new Promise((resolve) => {
      const voices = this.synthesis.getVoices();
      if (voices.length > 0) {
        this.voicesLoaded = true;
        resolve();
        return;
      }

      // Wait for voices to load
      this.synthesis.onvoiceschanged = () => {
        this.voicesLoaded = true;
        resolve();
      };

      // Timeout fallback
      setTimeout(() => {
        this.voicesLoaded = true;
        resolve();
      }, 1000);
    });
  }

  private chunkText(text: string): string[] {
    const maxLength = 180; // Safe limit for most browsers
    const chunks: string[] = [];
    
    // Split by sentence endings first
    const sentences = text.split(/(?<=[.!?।])\s+/);
    
    let currentChunk = '';
    
    for (const sentence of sentences) {
      // If single sentence is too long, split by commas or spaces
      if (sentence.length > maxLength) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }
        
        // Split long sentence by commas
        const parts = sentence.split(/(?<=,)\s+/);
        for (const part of parts) {
          if (part.length > maxLength) {
            // Last resort: split by words
            const words = part.split(' ');
            let wordChunk = '';
            for (const word of words) {
              if ((wordChunk + ' ' + word).length > maxLength) {
                if (wordChunk) chunks.push(wordChunk.trim());
                wordChunk = word;
              } else {
                wordChunk = wordChunk ? wordChunk + ' ' + word : word;
              }
            }
            if (wordChunk) chunks.push(wordChunk.trim());
          } else if ((currentChunk + ' ' + part).length > maxLength) {
            if (currentChunk) chunks.push(currentChunk.trim());
            currentChunk = part;
          } else {
            currentChunk = currentChunk ? currentChunk + ' ' + part : part;
          }
        }
      } else if ((currentChunk + ' ' + sentence).length > maxLength) {
        if (currentChunk) chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk = currentChunk ? currentChunk + ' ' + sentence : sentence;
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks.filter(c => c.length > 0);
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.speechQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    this.isSpeaking = true;
    this.onSpeakingChange?.(true);

    while (this.speechQueue.length > 0) {
      const chunk = this.speechQueue.shift()!;
      
      try {
        await this.speakChunk(chunk);
      } catch (error) {
        console.error('Error speaking chunk:', error);
        // Try once more with shorter text
        if (chunk.length > 50) {
          try {
            await this.speakChunk(chunk.substring(0, 50) + '...');
          } catch {
            // Skip this chunk
          }
        }
      }
      
      // Small pause between chunks for natural flow
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    this.isProcessingQueue = false;
    this.isSpeaking = false;
    this.onSpeakingChange?.(false);
  }

  private speakChunk(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Cancel any pending speech first
      this.synthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.config.language;
      utterance.rate = this.config.rate;
      utterance.pitch = this.config.pitch;
      utterance.volume = this.config.volume;

      // Try to get a voice that matches the language
      const voices = this.synthesis.getVoices();
      const matchingVoice = voices.find(v => v.lang.startsWith('en'));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      let resolved = false;

      utterance.onend = () => {
        if (!resolved) {
          resolved = true;
          resolve();
        }
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error || event);
        if (!resolved) {
          resolved = true;
          // Don't reject on 'interrupted' errors - these are normal when stopping
          if (event.error === 'interrupted' || event.error === 'canceled') {
            resolve();
          } else {
            reject(new Error(event.error || 'Speech synthesis error'));
          }
        }
      };

      // Timeout fallback (max 30 seconds per chunk)
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve();
        }
      }, 30000);

      this.synthesis.speak(utterance);
    });
  }

  async speak(text: string): Promise<void> {
    // Stop any current speech
    this.stop();

    // Wait for voices if not loaded
    if (!this.voicesLoaded) {
      await this.loadVoices();
    }

    // Chunk the text
    const chunks = this.chunkText(text);
    console.log('Speaking text in', chunks.length, 'chunks');

    // Add to queue
    this.speechQueue = chunks;

    // Start processing
    this.processQueue();
  }

  stop(): void {
    this.speechQueue = [];
    this.isProcessingQueue = false;
    
    if (this.synthesis.speaking || this.synthesis.pending) {
      this.synthesis.cancel();
    }
    
    if (this.isSpeaking) {
      this.isSpeaking = false;
      this.onSpeakingChange?.(false);
    }
  }

  isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }

  static isSupported(): boolean {
    return 'speechSynthesis' in window;
  }
}
