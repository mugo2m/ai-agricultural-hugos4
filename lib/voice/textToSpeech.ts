// lib/voice/textToSpeech.ts - WITH IMPROVED VOICE SELECTION
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
    rate: 0.75,
    pitch: 1.1,
    volume: 0.9,
    language: 'en-US' // Default language
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

      console.log(`TextToSpeech: Initialized with language: ${this.config.language}, rate: ${this.config.rate}`);

      // Pre-load voices
      this.getAvailableVoices();

      // Handle Chrome's bug where voices load asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
          console.log(`TextToSpeech: Voices loaded: ${this.synth?.getVoices().length}`);
        };
      }
    } else {
      console.warn("TextToSpeech: Speech Synthesis API is not supported.");
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
        this.delay(100);
      }

      // Clean the text - remove emojis, asterisks, formatting
      const cleanedText = this.cleanText(text);

      // Apply humanization if enabled
      const finalText = this._humanize ? this.humanizeInterviewText(cleanedText) : cleanedText;

      // Split long text to prevent lag and timeouts
      const MAX_LENGTH = 150;
      if (finalText.length > MAX_LENGTH) {
        console.log(`TextToSpeech: Text too long (${finalText.length} chars), splitting into chunks`);
        this.speakInChunks(finalText, MAX_LENGTH).then(resolve);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(finalText);

      // Apply configuration
      utterance.rate = this.config.rate || 0.75;
      utterance.pitch = this.config.pitch || 1.1;
      utterance.volume = this.config.volume || 0.9;
      utterance.lang = this.config.language || 'en-US';

      // Set the best voice for the language
      this.setBestVoice(utterance);

      // Store current utterance
      this.currentUtterance = utterance;

      // Event handlers
      utterance.onstart = () => {
        this.isSpeaking = true;
        console.log(`TextToSpeech: Started speaking in ${utterance.lang}`);
        this.events.onStart?.();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        console.log("TextToSpeech: Finished speaking");
        this.events.onEnd?.();
        resolve();
      };

      utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
        this.isSpeaking = false;
        this.currentUtterance = null;

        if (event.error === 'interrupted' || event.error === 'canceled') {
          console.log("TextToSpeech: Speech interrupted/canceled");
          this.events.onEnd?.();
          resolve();
          return;
        }

        console.warn("TextToSpeech: Error:", event.error);
        this.events.onError?.(`Speech error: ${event.error}`);
        console.log("AI says (fallback):", finalText);
        resolve();
      };

      try {
        this.synth.speak(utterance);

        // Safety timeout - increased for longer texts
        const safetyTimeout = setTimeout(() => {
          if (this.isSpeaking) {
            console.warn("TextToSpeech: Timeout after 15s, cancelling");
            this.synth?.cancel();
            this.isSpeaking = false;
            this.currentUtterance = null;
            console.log("AI says (timeout):", finalText);
            resolve();
          }
        }, 15000);

        // Clear timeout when speech ends normally
        const originalOnEnd = utterance.onend;
        utterance.onend = () => {
          clearTimeout(safetyTimeout);
          this.isSpeaking = false;
          this.currentUtterance = null;
          console.log("TextToSpeech: Finished speaking");
          this.events.onEnd?.();
          resolve();
        };

      } catch (error) {
        console.warn("TextToSpeech: Speak failed:", error);
        console.log("AI says:", finalText);
        resolve();
      }
    });
  }

  // Clean text of emojis and formatting
  private cleanText(text: string): string {
    return text
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
      .replace(/[\u{2600}-\u{26FF}]/gu, '')
      .replace(/[\u{2700}-\u{27BF}]/gu, '')
      .replace(/\*\*\*/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#{1,6}\s?/g, '')
      .replace(/_/g, '')
      .replace(/~/g, '')
      .replace(/`/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // ============ IMPROVED VOICE SELECTION ============
  private setBestVoice(utterance: SpeechSynthesisUtterance): void {
    if (!this.synth) return;

    const voices = this.synth.getVoices();
    if (voices.length === 0) {
      console.log("TextToSpeech: No voices available, using default");
      return;
    }

    const targetLang = utterance.lang; // e.g., 'fr-FR'

    // 1. Try exact language match with preferred female voices
    const exactLangVoices = voices.filter(v => v.lang === targetLang);
    if (exactLangVoices.length > 0) {
      // Prefer natural female voices in this order
      const priorityOrder = [
        'Microsoft Jenny', 'Microsoft Aria', 'Microsoft Sonia',
        'Google UK English Female', 'Google US English Female',
        'Samantha', 'Microsoft Hazel', 'Microsoft Zira'
      ];

      for (const preferred of priorityOrder) {
        const found = exactLangVoices.find(v => v.name.includes(preferred));
        if (found) {
          utterance.voice = found;
          console.log(`TextToSpeech: Using voice: ${found.name} (${found.lang})`);
          return;
        }
      }

      // If no preferred voice found, use the first exact match
      utterance.voice = exactLangVoices[0];
      console.log(`TextToSpeech: Using voice: ${exactLangVoices[0].name} (${exactLangVoices[0].lang})`);
      return;
    }

    // 2. Fallback to any voice starting with the language prefix (e.g., 'fr')
    const langPrefix = targetLang.split('-')[0];
    const similarVoices = voices.filter(v => v.lang.startsWith(langPrefix));
    if (similarVoices.length > 0) {
      utterance.voice = similarVoices[0];
      console.log(`TextToSpeech: Using fallback voice: ${similarVoices[0].name} (${similarVoices[0].lang})`);
      return;
    }

    // 3. Last resort: first English voice
    const englishVoice = voices.find(v => v.lang.startsWith('en-'));
    if (englishVoice) {
      utterance.voice = englishVoice;
      console.log(`TextToSpeech: Using English fallback: ${englishVoice.name}`);
    }
  }

  private humanizeInterviewText(text: string): string {
    if (this._humanize === false) return text;

    let humanized = text
      .replace(/\. /g, '. ... ')
      .replace(/\? /g, '? ... ')
      .replace(/\! /g, '! ... ');

    return humanized;
  }

  setHumanization(enabled: boolean): void {
    this._humanize = enabled;
    console.log(`TextToSpeech: Humanization ${enabled ? "enabled" : "disabled"}`);
  }

  private async speakInChunks(text: string, chunkSize: number): Promise<void> {
    const chunks = [];

    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

    for (const sentence of sentences) {
      if (sentence.length > chunkSize) {
        for (let i = 0; i < sentence.length; i += chunkSize) {
          chunks.push(sentence.substring(i, i + chunkSize));
        }
      } else {
        chunks.push(sentence);
      }
    }

    for (let i = 0; i < chunks.length; i++) {
      if (!this.isSpeaking) break;

      await this.speak(chunks[i]);

      if (i < chunks.length - 1) {
        await this.delay(500);
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  setVolume(volume: number): void {
    if (volume >= 0 && volume <= 1) {
      this.config.volume = volume;
      console.log(`TextToSpeech: Volume set to ${volume}`);
      this.events.onVolumeChange?.(volume);
      if (this.currentUtterance && this.isSpeaking) {
        this.currentUtterance.volume = volume;
      }
    }
  }

  setRate(rate: number): void {
    if (rate >= 0.5 && rate <= 2) {
      this.config.rate = rate;
      console.log(`TextToSpeech: Rate set to ${rate}`);
      this.events.onRateChange?.(rate);
      if (this.currentUtterance && this.isSpeaking) {
        this.currentUtterance.rate = rate;
      }
    }
  }

  setPitch(pitch: number): void {
    if (pitch >= 0.5 && pitch <= 2) {
      this.config.pitch = pitch;
      console.log(`TextToSpeech: Pitch set to ${pitch}`);
      if (this.currentUtterance && this.isSpeaking) {
        this.currentUtterance.pitch = pitch;
      }
    }
  }

  setLanguage(language: string): void {
    this.config.language = language;
    console.log(`TextToSpeech: Language set to ${language}`);

    // If currently speaking, restart with new language
    if (this.isSpeaking && this.currentUtterance) {
      const currentText = this.currentUtterance.text;
      this.stop();
      setTimeout(() => this.speak(currentText), 100);
    }
  }

  pause(): void {
    if (this.synth && this.isSpeaking) {
      this.synth.pause();
      console.log("TextToSpeech: Paused");
    }
  }

  resume(): void {
    if (this.synth && this.isSpeaking) {
      this.synth.resume();
      console.log("TextToSpeech: Resumed");
    }
  }

  stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.currentUtterance = null;
      console.log("TextToSpeech: Stopped");
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
      console.log("TextToSpeech: Not supported");
      return;
    }

    const voices = this.synth.getVoices();
    console.log("TextToSpeech Diagnostics:");
    console.log("Supported:", this.isSupported());
    console.log("Voices available:", voices.length);
    console.log("Current language:", this.config.language);

    if (voices.length > 0) {
      console.log("Available voices by language:");
      const voicesByLang = voices.reduce((acc: any, voice) => {
        if (!acc[voice.lang]) acc[voice.lang] = [];
        acc[voice.lang].push(voice.name);
        return acc;
      }, {});

      Object.keys(voicesByLang).forEach(lang => {
        console.log(`  ${lang}: ${voicesByLang[lang].length} voices`);
      });
    }

    console.log("Current config:", this.config);
    console.log("Currently speaking:", this.isSpeaking);
  }

  destroy(): void {
    this.stop();
    this.synth = null;
    this.events = {};
    console.log("TextToSpeech: Destroyed");
  }
}

export default TextToSpeech;