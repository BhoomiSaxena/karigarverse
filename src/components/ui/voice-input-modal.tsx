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
import { Mic, MicOff, Languages, CircleDot } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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

interface VoiceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (transcript: string) => void;
  currentValue?: string;
  fieldLabel?: string;
}

const supportedLanguages = [
  { code: "en-US", name: "English (US)" },
  { code: "en-IN", name: "English (India)" },
  { code: "hi-IN", name: "Hindi" },
];

export function VoiceInputModal({
  isOpen,
  onClose,
  onApply,
  currentValue = "",
  fieldLabel,
}: VoiceInputModalProps) {
  const { t } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [selectedLang, setSelectedLang] = useState("en-US");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [recognitionRef] = useState(() => {
    if (typeof window === "undefined") return null;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    return recognition;
  });

  useEffect(() => {
    // When the modal opens, initialize the transcript with the current value of the input field.
    if (isOpen) {
      setTranscript(currentValue);
    }
  }, [currentValue, isOpen]);

  useEffect(() => {
    if (!recognitionRef) return;

    setIsSupported(true);

    recognitionRef.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognitionRef.onend = () => {
      setIsListening(false);
    };

    recognitionRef.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error", event.error);
      setError(`Error: ${event.error}. Please check microphone permissions.`);
      setIsListening(false);
    };

    recognitionRef.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      // Append the new final transcript to the existing text
      if (finalTranscript) {
        setTranscript(
          (prev) => (prev ? prev + " " : "") + finalTranscript.trim()
        );
      }
    };

    return () => {
      recognitionRef?.stop();
    };
  }, [recognitionRef]);

  const toggleListening = () => {
    if (!recognitionRef) return;

    if (isListening) {
      recognitionRef.stop();
    } else {
      recognitionRef.lang = selectedLang;
      recognitionRef.start();
    }
  };

  const handleApply = () => {
    onApply(transcript);
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      if (isListening) {
        recognitionRef?.stop();
      }
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="font-kalam border-2 border-black rounded-none sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="h-6 w-6 text-blue-500" />
            {t("voice.voice_input_for", {
              field: fieldLabel || t("common.field"),
            })}
          </DialogTitle>
          <DialogDescription>
            {t("voice.click_start_speaking")}
          </DialogDescription>
        </DialogHeader>

        {!isSupported ? (
          <div className="text-red-600 bg-red-50 p-4 rounded-md">
            {t("voice.not_supported")}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Button
                type="button"
                onClick={toggleListening}
                className={cn(
                  "w-full sm:w-auto flex-1 text-lg py-6 border-2 border-black rounded-none",
                  isListening
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-green-500 hover:bg-green-600 text-white"
                )}
              >
                {isListening ? (
                  <>
                    <MicOff className="h-5 w-5 mr-2" />
                    {t("voice.stop_listening")}
                  </>
                ) : (
                  <>
                    <Mic className="h-5 w-5 mr-2" />
                    {t("voice.start_listening")}
                  </>
                )}
              </Button>
              <div className="w-full sm:w-auto">
                <Select
                  value={selectedLang}
                  onValueChange={setSelectedLang}
                  disabled={isListening}
                >
                  <SelectTrigger className="border-2 border-black/20 rounded-none h-12">
                    <Languages className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-2 border-black rounded-none">
                    {supportedLanguages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {t(`voice.supported_languages.${lang.code}`, lang.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="relative">
              <Textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder={t("voice.transcribed_text_placeholder")}
                className="min-h-[150px] border-2 border-black/20 rounded-none text-base"
              />
              {isListening && (
                <div className="absolute bottom-3 right-3 flex items-center gap-2 text-sm text-red-500">
                  <CircleDot className="h-4 w-4 animate-ping" />
                  {t("voice.listening")}
                </div>
              )}
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-2 border-black rounded-none"
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleApply}
            disabled={!isSupported}
            className="bg-blue-500 hover:bg-blue-600 text-white border-2 border-black rounded-none"
          >
            {t("voice.apply_text")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
