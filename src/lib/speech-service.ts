"use client";

export interface SpeechServiceConfig {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string, isInterim: boolean) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
  useAssemblyAI?: boolean;
}

export class SpeechService {
  private recognition: any = null;
  private isListening = false;
  private config: SpeechServiceConfig;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  constructor(config: SpeechServiceConfig = {}) {
    this.config = {
      lang: "en-US",
      continuous: false,
      interimResults: true,
      useAssemblyAI: false,
      ...config,
    };

    if (this.config.useAssemblyAI) {
      this.initializeAssemblyAI();
    } else {
      this.initializeRecognition();
    }
  }

  private async initializeAssemblyAI() {
    if (typeof window === "undefined") {
      console.warn("AssemblyAI recording is not available on server side");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: "audio/wav" });
        this.audioChunks = [];

        try {
          await this.transcribeWithAssemblyAI(audioBlob);
        } catch (error) {
          console.error("AssemblyAI transcription failed:", error);
          this.config.onError?.("Transcription failed. Please try again.");
        }
      };

      this.mediaRecorder.onstart = () => {
        this.isListening = true;
        this.config.onStart?.();
      };
    } catch (error) {
      console.error("Failed to initialize microphone:", error);
      this.config.onError?.(
        "Microphone access denied. Please enable microphone permissions."
      );
    }
  }

  private async transcribeWithAssemblyAI(audioBlob: Blob) {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.wav");
      formData.append("language", this.config.lang || "en");

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.transcript) {
        this.config.onResult?.(data.transcript, false);
      } else {
        throw new Error("No transcript received");
      }
    } catch (error) {
      console.error("AssemblyAI API error:", error);
      throw error;
    }
  }

  private initializeRecognition() {
    if (typeof window === "undefined") {
      console.warn("Speech recognition is not available on server side");
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech recognition is not supported in this browser");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = this.config.lang || "en-US";
    this.recognition.continuous = this.config.continuous || false;
    this.recognition.interimResults = this.config.interimResults || true;

    // Better configuration for multilingual support
    this.recognition.maxAlternatives = 1;
    if (this.config.lang === "hi-IN") {
      this.recognition.grammars = null; // Allow natural speech for Hindi
    }

    this.recognition.onstart = () => {
      this.isListening = true;
      this.config.onStart?.();
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.config.onEnd?.();
    };

    this.recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        this.config.onResult?.(finalTranscript.trim(), false);
      } else if (interimTranscript) {
        this.config.onResult?.(interimTranscript.trim(), true);
      }
    };

    this.recognition.onerror = (event: any) => {
      const errorMessage = this.getErrorMessage(event.error);
      this.config.onError?.(errorMessage);
      this.isListening = false;
    };
  }

  private getErrorMessage(error: string): string {
    switch (error) {
      case "no-speech":
        return "No speech was detected. Please try again.";
      case "audio-capture":
        return "Audio capture failed. Please check your microphone.";
      case "not-allowed":
        return "Microphone access was denied. Please allow microphone access.";
      case "network":
        return "Network error occurred. Please check your connection.";
      case "service-not-allowed":
        return "Speech recognition service is not allowed.";
      default:
        return `Speech recognition error: ${error}`;
    }
  }

  public isSupported(): boolean {
    if (typeof window === "undefined") return false;
    return !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );
  }

  public start(): boolean {
    if (this.config.useAssemblyAI) {
      return this.startAssemblyAIRecording();
    }

    if (!this.recognition) {
      this.config.onError?.("Speech recognition is not available");
      return false;
    }

    if (this.isListening) {
      this.config.onError?.("Already listening");
      return false;
    }

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      this.config.onError?.(`Failed to start recognition: ${error}`);
      return false;
    }
  }

  public stop() {
    if (this.config.useAssemblyAI) {
      this.stopAssemblyAIRecording();
    } else if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  public abort() {
    if (this.config.useAssemblyAI) {
      this.stopAssemblyAIRecording();
    } else if (this.recognition && this.isListening) {
      this.recognition.abort();
    }
  }

  private startAssemblyAIRecording(): boolean {
    if (!this.mediaRecorder) {
      this.config.onError?.("Media recorder is not available");
      return false;
    }

    if (this.isListening) {
      this.config.onError?.("Already recording");
      return false;
    }

    try {
      this.mediaRecorder.start();
      return true;
    } catch (error) {
      this.config.onError?.(`Failed to start recording: ${error}`);
      return false;
    }
  }

  private stopAssemblyAIRecording() {
    if (this.mediaRecorder && this.isListening) {
      this.mediaRecorder.stop();
      this.isListening = false;
      this.config.onEnd?.();
    }
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  public updateConfig(newConfig: Partial<SpeechServiceConfig>) {
    this.config = { ...this.config, ...newConfig };
    if (this.recognition) {
      this.recognition.lang = this.config.lang || "en-US";
      this.recognition.continuous = this.config.continuous || false;
      this.recognition.interimResults = this.config.interimResults || true;
    }
  }
}

// Helper function to create a speech service instance
export const createSpeechService = (config?: SpeechServiceConfig) => {
  return new SpeechService(config);
};

// Utility function to check if speech recognition is supported
export const isSpeechRecognitionSupported = (): boolean => {
  if (typeof window === "undefined") return false;
  return !!(
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  );
};
