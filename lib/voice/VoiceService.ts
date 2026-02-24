// lib/voice/VoiceService.ts - COMPLETE FIXED VERSION WITH STREAMING SUPPORT
"use client";

import { toast } from "sonner";
import SpeechToText from "./speechToText";
import TextToSpeech from "./textToSpeech";

export interface VoiceMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  transcript: string;
  error: string | null;
}

interface VoiceServiceConfig {
  interviewId: string;
  userId: string;
  type: "practice" | "review";
  language?: string;
  speechRate?: number;
  speechVolume?: number;
}

export class VoiceService {
  private state: VoiceState = {
    isListening: false,
    isSpeaking: false,
    isProcessing: false,
    transcript: "",
    error: null,
  };

  private messages: VoiceMessage[] = [];
  private interviewId: string;
  private userId: string;
  private type: "practice" | "review";
  private interviewQuestions: string[] = [];
  private currentQuestionIndex: number = 0;
  private isActive: boolean = false;
  private useHumanization: boolean = true;
  private isMicrophoneActive: boolean = false;
  private manualStop: boolean = false;

  private speechToText: SpeechToText | null = null;
  private textToSpeech: TextToSpeech | null = null;

  private onStateChangeCallback: ((state: VoiceState) => void) | null = null;
  private onUpdateCallback: ((messages: VoiceMessage[]) => void) | null = null;
  private onCompleteCallback: ((data: any) => void) | null = null;

  constructor(config: VoiceServiceConfig) {
    this.interviewId = config.interviewId;
    this.userId = config.userId;
    this.type = config.type;

    console.log("🎤 VoiceService: Initialized");

    this.speechToText = new SpeechToText();
    this.textToSpeech = new TextToSpeech({
      language: config.language || 'en-US',
      rate: config.speechRate || 0.9,
      volume: config.speechVolume || 0.9,
      pitch: 1.05
    });

    if (this.speechToText) {
      this.speechToText.onTranscript(this.handleUserTranscript.bind(this));
      this.speechToText.setLanguage(config.language || 'en-US');
      this.speechToText.setInterviewMode(true);

      console.log("🌐 VoiceService: SpeechToText initialized");

      // Immediate permission check
      setTimeout(() => {
        this.speechToText?.checkMicrophonePermissions().then(granted => {
          if (!granted) {
            toast.error("Please allow microphone access to use voice features");
          }
        });
      }, 1000);
    }
  }

  private handleUserTranscript = (text: string, isFinal: boolean): void => {
    console.log(`📝 Transcript: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}", isFinal: ${isFinal}`);

    // ALWAYS update transcript immediately
    this.updateState({ transcript: text });

    if (!this.isActive || !this.isMicrophoneActive) {
      console.log("⏸️ Not active, but transcript saved:", text.substring(0, 30));
      return;
    }

    if (isFinal) {
      console.log("✅ Final transcript captured");
    }
  };

  setHumanization(enabled: boolean): void {
    this.useHumanization = enabled;
    if (this.textToSpeech) {
      this.textToSpeech.setHumanization(enabled);
    }
  }

  public setInterviewQuestions(questions: string[]): void {
    this.interviewQuestions = questions;
    console.log("📋 Set", questions.length, "questions");
  }

  public async startInterview(): Promise<void> {
    console.log("🎬 Starting interview");

    if (this.interviewQuestions.length === 0) {
      throw new Error("No interview questions set");
    }

    this.isActive = true;
    this.manualStop = false;
    this.currentQuestionIndex = 0;
    this.messages = [];
    this.updateState({
      isProcessing: true,
      transcript: ""
    });

    try {
      await this.speak("Interview starting...");
      await this.delay(1000);
      await this.askCurrentQuestion();
    } catch (error: any) {
      console.error("❌ Failed to start:", error);
      this.handleError(error.message);
    }
  }

  private async askCurrentQuestion(): Promise<void> {
    console.log(`📢 askCurrentQuestion: index=${this.currentQuestionIndex}, total=${this.interviewQuestions.length}, isActive=${this.isActive}`);

    if (!this.isActive) {
      console.log("⏸️ Not active, returning");
      return;
    }

    if (this.currentQuestionIndex >= this.interviewQuestions.length) {
      console.log("🎯🎯🎯 COMPLETION CONDITION MET! 🎯🎯🎯");
      console.log(`   Index: ${this.currentQuestionIndex}, Total: ${this.interviewQuestions.length}`);
      await this.completeInterview();
      return;
    }

    const question = this.interviewQuestions[this.currentQuestionIndex];
    console.log(`❓ Asking question ${this.currentQuestionIndex + 1}:`, question.substring(0, 50));

    const questionMessage: VoiceMessage = {
      role: "assistant",
      content: `Question ${this.currentQuestionIndex + 1}: ${question}`,
      timestamp: Date.now(),
    };
    this.messages.push(questionMessage);
    this.onUpdateCallback?.(this.messages);

    await this.speak(`Question ${this.currentQuestionIndex + 1}. ${question}`);

    await this.delay(500);
    await this.startListening();
  }

  private async startListening(): Promise<void> {
    console.log(`👂 Start listening for question ${this.currentQuestionIndex + 1}`);

    if (!this.isActive || !this.speechToText) {
      console.log("⏸️ Cannot start listening");
      return;
    }

    // Stop any existing session
    try {
      if (this.speechToText.getIsListening()) {
        this.speechToText.stop();
        await this.delay(300);
      }
    } catch (e) {}

    this.updateState({
      isListening: true,
      isSpeaking: false
    });

    this.isMicrophoneActive = true;
    this.manualStop = false;

    toast.info(`🎤 Question ${this.currentQuestionIndex + 1} - Speak your answer`);

    try {
      this.speechToText.clearTranscript();
      await this.speechToText.start();
      console.log("✅ Listening started successfully");
    } catch (error: any) {
      console.error("❌ Failed to start listening:", error);
      this.updateState({ isListening: false });
      this.isMicrophoneActive = false;
      toast.error("Microphone access failed. Please check permissions.");
    }
  }

  private humanizeInterviewQuestion(text: string): string {
    if (!this.useHumanization) return text;

    let humanized = text
      .replace(/Question \d+\. /g, (match) => {
        const variations = ['Next question. ', 'Moving on. ', 'Alright. ', 'Great. '];
        return variations[Math.floor(Math.random() * variations.length)] + match;
      })
      .replace(/\. /g, '. ... ')
      .replace(/\?/g, '? ... ');

    return humanized;
  }

  public async submitAnswer(): Promise<void> {
    console.log(`✅ Submit answer for question ${this.currentQuestionIndex + 1}`);

    if (!this.isActive) {
      toast.error("Interview not active");
      return;
    }

    // Stop listening
    this.isMicrophoneActive = false;
    this.manualStop = true;
    this.speechToText?.stop();
    this.updateState({ isListening: false });

    const answerText = this.state.transcript.trim();

    if (!answerText) {
      console.log("⚠️ No answer to submit");
      toast.warning("Please speak an answer first");

      // Resume listening
      this.isMicrophoneActive = true;
      this.manualStop = false;
      await this.startListening();
      return;
    }

    // 🔥 FIX: Prevent empty or very short answers
    if (answerText.length < 3) {
      console.log("⚠️ Answer too short, please speak more");
      toast.warning("Please provide a longer answer (at least 3 words)");

      // Resume listening
      this.isMicrophoneActive = true;
      this.manualStop = false;
      await this.startListening();
      return;
    }

    // Check word count (optional but recommended)
    const wordCount = answerText.split(/\s+/).length;
    if (wordCount < 3) {
      console.log("⚠️ Answer too short - only", wordCount, "words");
      toast.warning("Please provide a more detailed answer (at least 3 words)");

      // Resume listening
      this.isMicrophoneActive = true;
      this.manualStop = false;
      await this.startListening();
      return;
    }

    console.log(`📤 Submitting answer (${answerText.length} chars, ${wordCount} words):`, answerText.substring(0, 50));

    // Save answer
    const answerMessage: VoiceMessage = {
      role: "user",
      content: answerText,
      timestamp: Date.now(),
    };
    this.messages.push(answerMessage);
    this.onUpdateCallback?.(this.messages);

    toast.success(`✅ Answer ${this.currentQuestionIndex + 1} submitted`);

    await this.speak("Thank you.");
    await this.delay(800);

    // Move to next question
    this.currentQuestionIndex++;

    // Clear transcript AFTER saving
    this.updateState({ transcript: "" });

    await this.askCurrentQuestion();
  }

  public async skipQuestion(): Promise<void> {
    console.log(`⏭️ Skip question ${this.currentQuestionIndex + 1}`);

    if (!this.isActive) return;

    this.isMicrophoneActive = false;
    this.manualStop = true;
    this.speechToText?.stop();
    this.updateState({ isListening: false });

    const skipMessage: VoiceMessage = {
      role: "user",
      content: `[Skipped question ${this.currentQuestionIndex + 1}]`,
      timestamp: Date.now(),
    };
    this.messages.push(skipMessage);
    this.onUpdateCallback?.(this.messages);

    toast.info(`⏭️ Question ${this.currentQuestionIndex + 1} skipped`);

    await this.speak("Question skipped.");
    await this.delay(800);

    this.currentQuestionIndex++;
    this.updateState({ transcript: "" });
    await this.askCurrentQuestion();
  }

  private async completeInterview(): Promise<void> {
    console.log("🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁");
    console.log("🏁 COMPLETE INTERVIEW CALLED! 🏁");
    console.log("🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁");
    console.log("📊 State:", {
      isActive: this.isActive,
      interviewId: this.interviewId,
      userId: this.userId,
      currentQuestionIndex: this.currentQuestionIndex,
      totalQuestions: this.interviewQuestions.length,
      messagesCount: this.messages.length,
      userMessages: this.messages.filter(m => m.role === 'user').length,
      hasCallback: !!this.onCompleteCallback
    });

    if (!this.isActive) {
      console.log("⏸️ Not active, cannot complete");
      return;
    }

    this.isActive = false;
    this.isMicrophoneActive = false;
    this.manualStop = true;
    this.speechToText?.stop();

    this.updateState({
      isListening: false,
      isSpeaking: false,
      isProcessing: true
    });

    await this.speak("Interview completed.");

    const userAnswers = this.messages.filter(m => m.role === 'user');
    console.log(`📊 Interview completed with ${userAnswers.length} answers`);

    const completionData = {
      success: true,
      interviewId: this.interviewId,
      userId: this.userId,
      feedbackId: `local-${Date.now()}`,
      questionsAsked: this.interviewQuestions.length,
      answersGiven: userAnswers.length,
      transcript: this.messages,
      timestamp: new Date().toISOString(),
      fallback: false
    };

    console.log("📦 Completion data prepared:", completionData);

    // 🔥 CRITICAL: Call the callback IMMEDIATELY with loud logging
    if (this.onCompleteCallback) {
      console.log("📞📞📞 CALLING ONCOMPLETE CALLBACK! 📞📞📞");
      console.log("   Callback function exists, executing now...");
      this.onCompleteCallback(completionData);
      console.log("✅ ONCOMPLETE CALLBACK EXECUTED");
    } else {
      console.error("❌❌❌ NO ONCOMPLETE CALLBACK REGISTERED! ❌❌❌");
      console.error("   This is why Agent.tsx never receives completion!");

      // Try again after a delay (in case callback is registered late)
      console.log("⏰ Will retry callback in 500ms...");
      setTimeout(() => {
        if (this.onCompleteCallback) {
          console.log("📞📞📞 CALLING ONCOMPLETE CALLBACK (DELAYED)! 📞📞📞");
          this.onCompleteCallback(completionData);
          console.log("✅ DELAYED CALLBACK EXECUTED");
        } else {
          console.error("❌❌❌ STILL NO CALLBACK AFTER DELAY! ❌❌❌");
          console.error("   Check that Agent.tsx registers onComplete BEFORE startInterview");
        }
      }, 500);
    }

    this.updateState({ isProcessing: false });
    console.log("✅ Interview completion process finished");
  }

  // ============ NEW: Streaming speak method ============
  public async speakStreaming(text: string): Promise<void> {
    if (!this.textToSpeech) {
      console.log("🤖 AI:", text);
      return;
    }

    this.updateState({ isSpeaking: true });

    try {
      // Split into sentences for natural streaming
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

      for (const sentence of sentences) {
        if (!this.isActive && this.type !== "review") break; // Allow streaming even when not in active mode for recommendations

        await this.textToSpeech.speak(sentence);

        // Small pause between sentences
        await this.delay(300);
      }
    } catch (error) {
      console.log("🤖 AI (fallback):", text);
    } finally {
      this.updateState({ isSpeaking: false });
    }
  }

  // ============ NEW: Speak recommendations one by one ============
  public async speakRecommendations(recommendations: string[]): Promise<void> {
    if (!recommendations || recommendations.length === 0) return;

    // Speak intro
    await this.speakStreaming("I have prepared some personalized recommendations for your farm. Let me read them to you.");
    await this.delay(1000);

    // Speak each recommendation with a pause
    for (let i = 0; i < recommendations.length; i++) {
      const rec = recommendations[i];
      await this.speakStreaming(`Recommendation ${i + 1}: ${rec}`);
      await this.delay(800);
    }

    await this.speakStreaming("You can now ask me any questions about your farm. Just speak clearly and press the submit button.");
  }

  // ============ NEW: Start farmer session ============
  public async startFarmerSession(sessionData: any): Promise<void> {
    console.log("🌾 Starting farmer session");

    this.isActive = true;
    this.manualStop = false;
    this.messages = [];
    this.updateState({
      isProcessing: false,
      transcript: ""
    });

    // Just set active state - recommendations will be spoken by Agent
    this.updateState({ isSpeaking: false, isListening: false });
  }

  // ============ NEW: Listen for farmer question ============
  public async listenForQuestion(): Promise<void> {
    console.log("👂 Listening for farmer question");

    if (!this.isActive || !this.speechToText) {
      console.log("⏸️ Cannot start listening");
      return;
    }

    // Stop any existing session
    try {
      if (this.speechToText.getIsListening()) {
        this.speechToText.stop();
        await this.delay(300);
      }
    } catch (e) {}

    this.updateState({
      isListening: true,
      isSpeaking: false
    });

    this.isMicrophoneActive = true;
    this.manualStop = false;

    toast.info("🎤 Listening for your question...");

    try {
      this.speechToText.clearTranscript();
      await this.speechToText.start();
      console.log("✅ Listening started successfully");
    } catch (error: any) {
      console.error("❌ Failed to start listening:", error);
      this.updateState({ isListening: false });
      this.isMicrophoneActive = false;
      toast.error("Microphone access failed. Please check permissions.");
    }
  }

  private async speak(text: string): Promise<void> {
    if (!this.textToSpeech) {
      console.log("🤖 AI:", text);
      return;
    }

    this.updateState({ isSpeaking: true });
    try {
      await this.textToSpeech.speak(text);
    } catch (error) {
      console.log("🤖 AI (fallback):", text);
    } finally {
      this.updateState({ isSpeaking: false });
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private updateState(updates: Partial<VoiceState>): void {
    this.state = { ...this.state, ...updates };
    this.onStateChangeCallback?.(this.state);
  }

  private handleError(error: string): void {
    console.error("❌ Error:", error);
    this.state.error = error;
    this.isActive = false;
    this.isMicrophoneActive = false;
  }

  public stop(): void {
    console.log("🛑 Stopping");
    this.isActive = false;
    this.isMicrophoneActive = false;
    this.manualStop = true;
    this.speechToText?.stop();
    this.textToSpeech?.stop();
    this.updateState({
      isListening: false,
      isSpeaking: false,
      isProcessing: false
    });
  }

  public getState(): VoiceState {
    return this.state;
  }

  public onStateChange(callback: (state: VoiceState) => void): void {
    this.onStateChangeCallback = callback;
  }

  public onUpdate(callback: (messages: VoiceMessage[]) => void): void {
    this.onUpdateCallback = callback;
  }

  public onComplete(callback: (data: any) => void): void {
    console.log("📞 onComplete callback REGISTERED in VoiceService");
    this.onCompleteCallback = callback;
  }

  public destroy(): void {
    console.log("🗑️ Destroying");
    this.stop();
    this.speechToText?.destroy();
    this.textToSpeech?.destroy();
    this.onStateChangeCallback = null;
    this.onUpdateCallback = null;
    this.onCompleteCallback = null;
    this.messages = [];
    this.interviewQuestions = [];
  }
}

// ✅ CRITICAL: This line MUST be here!
export default VoiceService;