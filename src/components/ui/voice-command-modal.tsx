"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, CircleDot, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

// Extend the Window interface to include speech recognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

// Define SpeechRecognition interface
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror:
    | ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any)
    | null;
  onresult:
    | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any)
    | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new (): SpeechRecognition;
};

interface VoiceCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (value: number) => void;
  fieldLabel?: string;
}

// A simple parser to extract numbers from text
const parseNumberFromText = (text: string): number | null => {
  const numbers = text.match(/\d+/g);
  if (numbers) {
    return parseInt(numbers[numbers.length - 1], 10);
  }
  return null;
};

export function VoiceCommandModal({
  isOpen,
  onClose,
  onApply,
  fieldLabel,
}: VoiceCommandModalProps) {
  const { t } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [parsedNumber, setParsedNumber] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recognitionRef] = useState(() => {
    if (typeof window === "undefined") return null;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = false; // We only need a single command
    recognition.interimResults = false;

    return recognition;
  });

  useEffect(() => {
    if (!recognitionRef) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    setIsSupported(true);

    recognitionRef.onstart = () => {
      setIsListening(true);
      setError(null);
      setTranscript("");
      setParsedNumber(null);
    };

    recognitionRef.onend = () => {
      setIsListening(false);
    };

    recognitionRef.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error", event.error);
      setError(`Error: ${event.error}. Please try again.`);
      setIsListening(false);
    };

    recognitionRef.onresult = (event: SpeechRecognitionEvent) => {
      const lastResult = event.results[event.results.length - 1];
      if (lastResult.isFinal) {
        const text = lastResult[0].transcript;
        setTranscript(text);
        const num = parseNumberFromText(text);
        setParsedNumber(num);
        if (num !== null) {
          // Automatically apply if a number is found
          onApply(num);
          onClose();
        }
      }
    };

    return () => {
      recognitionRef?.stop();
    };
  }, [recognitionRef, onApply, onClose]);

  const startListening = () => {
    if (!recognitionRef || isListening) return;
    recognitionRef.lang = "en-US"; // Command parsing is simpler in one language
    recognitionRef.start();
  };

  // Automatically start listening when the modal opens
  useEffect(() => {
    if (isOpen) {
      startListening();
    }
  }, [isOpen]);

  const handleApply = () => {
    if (parsedNumber !== null) {
      onApply(parsedNumber);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="font-kalam border-2 border-black rounded-none sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="h-6 w-6 text-green-500" />
            Voice Command for {fieldLabel || "Field"}
          </DialogTitle>
          <DialogDescription>
            {isListening ? "Listening..." : "Say a command like:"}
            <span className="block text-gray-500 text-sm mt-2">
              e.g., "Set price to 500" or "Update stock to 20"
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="my-8 flex flex-col items-center justify-center h-24 bg-gray-50 rounded-lg border-2 border-dashed">
          {isListening ? (
            <div className="flex items-center gap-3 text-lg text-blue-600">
              <CircleDot className="h-6 w-6 animate-ping" />
              <span>Listening...</span>
            </div>
          ) : (
            <p className="text-gray-600">
              {transcript ? `"${transcript}"` : "Waiting for command..."}
            </p>
          )}
          {parsedNumber !== null && !isListening && (
            <p className="text-green-600 font-bold text-xl mt-2">
              Detected Value: {parsedNumber}
            </p>
          )}
          {transcript && parsedNumber === null && !isListening && (
            <p className="text-red-600 font-bold mt-2">
              No number detected. Please try again.
            </p>
          )}
        </div>

        {error && <p className="text-sm text-center text-red-600">{error}</p>}

        <DialogFooter className="flex-col sm:flex-col sm:space-x-0 gap-2">
          <Button
            type="button"
            onClick={startListening}
            disabled={isListening}
            className="w-full text-lg py-6 border-2 border-black rounded-none bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Mic className="h-5 w-5 mr-2" />
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full border-2 border-black rounded-none"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
