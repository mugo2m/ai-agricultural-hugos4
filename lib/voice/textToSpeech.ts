// lib/voice/textToSpeech.ts - UPDATED WITH BETTER VOICE, NO LAG, NO EMOJIS/FORMATTING
"use client";

export interface SpeechSynthesisConfig {
  voiceName?: string;
  language?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export interface TextToSpeechEvents {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
  onVolumeChange?: (volume: number) => void;
  onRateChange?: (rate: number) => void;
}

export class TextToSpeech {
  private synth: SpeechSynthesis | null = null;
  private isSpeaking: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  private config: SpeechSynthesisConfig = {
    rate: 0.75,      // CHANGED: Even slower for clarity (was 0.9)
    pitch: 1.1,      // CHANGED: Slightly higher = more natural (was 1.05)
    volume: 0.9,
    language: 'en-US'
  };

  private events: TextToSpeechEvents = {};
  private _humanize: boolean = true;

  constructor(config?: SpeechSynthesisConfig) {
    if (typeof window === "undefined") {
      return;
    }

    if ('speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.config = { ...this.config, ...config };

      console.log("🔊 TextToSpeech: Initialized with config:", this.config);

      // Pre-load voices
      this.getAvailableVoices();

      // Handle Chrome's bug where voices load asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
          console.log("🔊 TextToSpeech: Voices loaded:", this.synth?.getVoices().length);
        };
      }
    } else {
      console.warn("⚠️ TextToSpeech: Speech Synthesis API is not supported.");
    }
  }

  speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) {
        console.log("AI says:", this.cleanText(text));
        resolve();
        return;
      }

      // Cancel any ongoing speech
      if (this.isSpeaking) {
        this.synth.cancel();
        this.delay(100); // Small pause before starting new speech
      }

      // Clean the text - remove emojis, asterisks, formatting
      const cleanedText = this.cleanText(text);

      // Apply humanization if enabled
      const finalText = this._humanize ? this.humanizeInterviewText(cleanedText) : cleanedText;

      // Split long text to prevent lag and timeouts
      const MAX_LENGTH = 150; // REDUCED: Smaller chunks (was 200)
      if (finalText.length > MAX_LENGTH) {
        console.log("📝 TextToSpeech: Text too long, splitting into chunks");
        this.speakInChunks(finalText, MAX_LENGTH).then(resolve);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(finalText);

      // Apply configuration
      utterance.rate = this.config.rate || 0.75;
      utterance.pitch = this.config.pitch || 1.1;
      utterance.volume = this.config.volume || 0.9;
      utterance.lang = this.config.language || 'en-US';

      // Set the best female voice
      this.setBestVoice(utterance);

      // Store current utterance
      this.currentUtterance = utterance;

      // Event handlers
      utterance.onstart = () => {
        this.isSpeaking = true;
        console.log("🔊 TextToSpeech: Started speaking");
        this.events.onStart?.();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        console.log("✅ TextToSpeech: Finished speaking");
        this.events.onEnd?.();
        resolve();
      };

      utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
        this.isSpeaking = false;
        this.currentUtterance = null;

        if (event.error === 'interrupted' || event.error === 'canceled') {
          console.log("⏹️ TextToSpeech: Speech interrupted/canceled");
          this.events.onEnd?.();
          resolve();
          return;
        }

        console.warn("❌ TextToSpeech: Error:", event.error);
        this.events.onError?.(`Speech error: ${event.error}`);
        console.log("AI says (fallback):", finalText);
        resolve();
      };

      try {
        this.synth.speak(utterance);

        // Safety timeout - increased for longer texts
        const safetyTimeout = setTimeout(() => {
          if (this.isSpeaking) {
            console.warn("⏰ TextToSpeech: Timeout after 15s, cancelling");
            this.synth?.cancel();
            this.isSpeaking = false;
            this.currentUtterance = null;
            console.log("AI says (timeout):", finalText);
            resolve();
          }
        }, 15000); // INCREASED: 15 seconds (was 10s)

        // Clear timeout when speech ends normally
        const originalOnEnd = utterance.onend;
        utterance.onend = () => {
          clearTimeout(safetyTimeout);
          this.isSpeaking = false;
          this.currentUtterance = null;
          console.log("✅ TextToSpeech: Finished speaking");
          this.events.onEnd?.();
          resolve();
        };

      } catch (error) {
        console.warn("❌ TextToSpeech: Speak failed:", error);
        console.log("AI says:", finalText);
        resolve();
      }
    });
  }

  // NEW: Clean text of emojis, asterisks, and formatting
  private cleanText(text: string): string {
    return text
      // Remove emojis (Unicode emoji ranges)
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Symbols & pictographs
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport & map symbols
      .replace(/[\u{1F700}-\u{1F77F}]/gu, '') // Alchemical symbols
      .replace(/[\u{1F780}-\u{1F7FF}]/gu, '') // Geometric shapes
      .replace(/[\u{1F800}-\u{1F8FF}]/gu, '') // Supplemental arrows
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental symbols
      .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '') // Chess symbols
      .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // Symbols and pictographs extended
      .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Miscellaneous symbols
      .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
      // Remove asterisks and markdown
      .replace(/\*\*\*/g, '') // Triple asterisks
      .replace(/\*\*/g, '')   // Double asterisks
      .replace(/\*/g, '')     // Single asterisks
      .replace(/#{1,6}\s?/g, '') // Hashes
      .replace(/_/g, '')      // Underscores
      .replace(/~/g, '')      // Tildes
      .replace(/`/g, '')      // Backticks
      // Clean up multiple spaces
      .replace(/\s+/g, ' ')
      .trim();
  }

  // IMPROVED: Voice selection - prioritize natural female voices
  private setBestVoice(utterance: SpeechSynthesisUtterance): void {
    if (!this.synth) return;

    const voices = this.synth.getVoices();
    if (voices.length === 0) {
      console.log("🔊 TextToSpeech: No voices available, using default");
      return;
    }

    // Priority list: Natural female voices (Neural)
    const priorityOrder = [
      'Microsoft Jenny',     // US - Natural (Neural)
      'Microsoft Aria',      // US - Natural (Neural)
      'Microsoft Sonia',     // UK - Natural (Neural)
      'Google UK English Female',
      'Google US English Female',
      'Samantha',            // US - Apple
      'Microsoft Hazel',     // UK - Legacy
      'Microsoft Zira'       // US - Legacy (last resort)
    ];

    // Find the best matching voice
    for (const preferred of priorityOrder) {
      const found = voices.find(v =>
        v.name.includes(preferred) && v.lang.startsWith('en-')
      );
      if (found) {
        utterance.voice = found;
        console.log(`🔊 TextToSpeech: Using voice: ${found.name}`);
        return;
      }
    }

    // Fallback: Find any female-sounding English voice
    const femaleVoice = voices.find(v => {
      const name = v.name.toLowerCase();
      return (name.includes('female') || name.includes('woman')) &&
             v.lang.startsWith('en-');
    });

    if (femaleVoice) {
      utterance.voice = femaleVoice;
      console.log(`🔊 TextToSpeech: Using female voice: ${femaleVoice.name}`);
      return;
    }

    // Last resort: first English voice
    const englishVoice = voices.find(v => v.lang.startsWith('en-'));
    if (englishVoice) {
      utterance.voice = englishVoice;
      console.log(`🔊 TextToSpeech: Using English voice: ${englishVoice.name}`);
    }
  }

  private humanizeInterviewText(text: string): string {
    if (this._humanize === false) return text;

    // Add natural pauses but don't overdo it
    let humanized = text
      .replace(/\. /g, '. ... ')      // Pause after sentences
      .replace(/\? /g, '? ... ')      // Pause after questions
      .replace(/\! /g, '! ... ');     // Pause after exclamations

    // Reduce repetitive use of farmer name by replacing some instances
    // This is a simple fix - the main personalization happens in VoiceService
    humanized = humanized
      .replace(/(\w+)'s/g, 'your')    // Replace "mugo's" with "your" sometimes
      .replace(/\b(\w+)\b(?= need)/g, 'you'); // Replace "mugo need" with "you need"

    console.log("🎭 TextToSpeech: Humanized text");
    return humanized;
  }

  setHumanization(enabled: boolean): void {
    this._humanize = enabled;
    console.log("🎭 TextToSpeech: Humanization", enabled ? "enabled" : "disabled");
  }

  private async speakInChunks(text: string, chunkSize: number): Promise<void> {
    const chunks = [];

    // Split by sentences when possible
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

    for (const sentence of sentences) {
      if (sentence.length > chunkSize) {
        // Further split long sentences
        for (let i = 0; i < sentence.length; i += chunkSize) {
          chunks.push(sentence.substring(i, i + chunkSize));
        }
      } else {
        chunks.push(sentence);
      }
    }

    for (let i = 0; i < chunks.length; i++) {
      if (!this.isSpeaking) break; // Stop if cancelled

      await this.speak(chunks[i]);

      // Longer pause between major chunks
      if (i < chunks.length - 1) {
        await this.delay(500); // INCREASED: 500ms pause (was 300ms)
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Volume and rate control methods remain the same...
  setVolume(volume: number): void {
    if (volume >= 0 && volume <= 1) {
      this.config.volume = volume;
      console.log("🔊 TextToSpeech: Volume set to", volume);
      this.events.onVolumeChange?.(volume);
      if (this.currentUtterance && this.isSpeaking) {
        this.currentUtterance.volume = volume;
      }
    }
  }

  setRate(rate: number): void {
    if (rate >= 0.5 && rate <= 2) {
      this.config.rate = rate;
      console.log("🎵 TextToSpeech: Rate set to", rate);
      this.events.onRateChange?.(rate);
      if (this.currentUtterance && this.isSpeaking) {
        this.currentUtterance.rate = rate;
      }
    }
  }

  setPitch(pitch: number): void {
    if (pitch >= 0.5 && pitch <= 2) {
      this.config.pitch = pitch;
      console.log("🎶 TextToSpeech: Pitch set to", pitch);
      if (this.currentUtterance && this.isSpeaking) {
        this.currentUtterance.pitch = pitch;
      }
    }
  }

  setLanguage(language: string): void {
    this.config.language = language;
    console.log("🌐 TextToSpeech: Language set to", language);
  }

  pause(): void {
    if (this.synth && this.isSpeaking) {
      this.synth.pause();
      console.log("⏸️ TextToSpeech: Paused");
    }
  }

  resume(): void {
    if (this.synth && this.isSpeaking) {
      this.synth.resume();
      console.log("▶️ TextToSpeech: Resumed");
    }
  }

  stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.currentUtterance = null;
      console.log("🛑 TextToSpeech: Stopped");
    }
  }

  getVolume(): number { return this.config.volume || 0.9; }
  getRate(): number { return this.config.rate || 0.75; }
  getPitch(): number { return this.config.pitch || 1.1; }
  getLanguage(): string { return this.config.language || 'en-US'; }
  getIsSpeaking(): boolean { return this.isSpeaking; }

  onStart(callback: () => void): void { this.events.onStart = callback; }
  onEnd(callback: () => void): void { this.events.onEnd = callback; }
  onError(callback: (error: string) => void): void { this.events.onError = callback; }
  onVolumeChange(callback: (volume: number) => void): void { this.events.onVolumeChange = callback; }
  onRateChange(callback: (rate: number) => void): void { this.events.onRateChange = callback; }

  isSupported(): boolean { return this.synth !== null; }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  printVoiceDiagnostics(): void {
    if (!this.synth) {
      console.log("❌ TextToSpeech: Not supported");
      return;
    }

    const voices = this.synth.getVoices();
    console.log("🔍 TextToSpeech Diagnostics:");
    console.log("✅ Supported:", this.isSupported());
    console.log("🎤 Voices available:", voices.length);

    if (voices.length > 0) {
      console.log("📋 Voice list:");
      voices.slice(0, 10).forEach((voice, i) => {
        console.log(`  ${i + 1}. ${voice.name} (${voice.lang}) - ${voice.default ? 'Default' : ''}`);
      });
    }

    console.log("⚙️ Current config:", this.config);
    console.log("🎤 Currently speaking:", this.isSpeaking);
  }

  destroy(): void {
    this.stop();
    this.synth = null;
    this.events = {};
    console.log("🧹 TextToSpeech: Destroyed");
  }
}

export default TextToSpeech;