"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Check,
  AlertCircle,
  Loader2,
  Settings,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  SpeechService,
  isSpeechRecognitionSupported,
} from "@/lib/speech-service";

interface VoiceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (transcript: string) => void;
  title: string;
  description?: string;
  placeholder?: string;
  initialValue?: string;
  field?: string;
  maxLength?: number;
}

// Animation variants following Karigarverse patterns
const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: 20 },
};

const waveVariants = {
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.5, 1, 0.5],
  },
};

const pulseVariants = {
  animate: {
    scale: [1, 1.05, 1],
  },
};

const languageOptions = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "hi", label: "हिंदी (Hindi)", flag: "🇮🇳" },
];

export function VoiceInputModal({
  isOpen,
  onClose,
  onApply,
  title,
  description,
  placeholder = "Your transcribed text will appear here...",
  initialValue = "",
  field = "text",
  maxLength = 500,
}: VoiceInputModalProps) {
  const [transcript, setTranscript] = useState(initialValue);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [useAssemblyAI, setUseAssemblyAI] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const speechServiceRef = useRef<SpeechService | null>(null);

  // Initialize speech service
  useEffect(() => {
    setIsSupported(isSpeechRecognitionSupported());

    if (isSpeechRecognitionSupported() || useAssemblyAI) {
      speechServiceRef.current = new SpeechService({
        lang: selectedLanguage === "hi" ? "hi-IN" : "en-US",
        continuous: false,
        interimResults: true,
        useAssemblyAI: useAssemblyAI,
        onResult: (text: string, isInterim: boolean) => {
          if (isInterim) {
            setInterimTranscript(text);
          } else {
            setTranscript((prev) => {
              const newText = prev ? `${prev} ${text}` : text;
              return newText.substring(0, maxLength);
            });
            setInterimTranscript("");
            setIsProcessing(false);
          }
        },
        onError: (errorMessage: string) => {
          setError(errorMessage);
          setIsListening(false);
          setIsProcessing(false);
        },
        onStart: () => {
          setIsListening(true);
          setError(null);
          setHasStarted(true);
          if (useAssemblyAI) {
            setIsProcessing(true);
          }
        },
        onEnd: () => {
          setIsListening(false);
          if (useAssemblyAI) {
            setIsProcessing(true);
          }
        },
      });
    }

    return () => {
      if (speechServiceRef.current) {
        speechServiceRef.current.stop();
      }
    };
  }, [maxLength, selectedLanguage, useAssemblyAI]);

  // Update speech service when language or AI option changes
  useEffect(() => {
    if (speechServiceRef.current) {
      speechServiceRef.current.updateConfig({
        lang: selectedLanguage === "hi" ? "hi-IN" : "en-US",
        useAssemblyAI: useAssemblyAI,
      });
    }
  }, [selectedLanguage, useAssemblyAI]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setTranscript(initialValue);
      setInterimTranscript("");
      setError(null);
      setHasStarted(false);
      setIsListening(false);
    } else {
      handleStopListening();
    }
  }, [isOpen, initialValue]);

  const handleStartListening = () => {
    if (!speechServiceRef.current || !isSupported) {
      setError("Speech recognition is not supported in your browser.");
      return;
    }

    const started = speechServiceRef.current.start();
    if (!started) {
      setError("Failed to start speech recognition. Please try again.");
    }
  };

  const handleStopListening = () => {
    if (speechServiceRef.current) {
      speechServiceRef.current.stop();
    }
    setIsListening(false);
  };

  const handleClearTranscript = () => {
    setTranscript("");
    setInterimTranscript("");
    setError(null);
    handleStopListening();
  };

  const handleApply = () => {
    if (transcript.trim()) {
      onApply(transcript.trim());
      onClose();
    }
  };

  const getDisplayText = () => {
    return transcript + (interimTranscript ? ` ${interimTranscript}` : "");
  };

  const getCharacterCount = () => {
    return getDisplayText().length;
  };

  if (!isSupported) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md bg-white border-2 border-black font-kalam">
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-black">
                Speech Recognition Not Supported
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Alert className="border-red-300 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your browser doesn't support speech recognition. Please use a
                  modern browser like Chrome, Edge, or Safari.
                </AlertDescription>
              </Alert>
              <Button
                onClick={onClose}
                className="w-full bg-black text-white hover:bg-gray-800"
              >
                Close
              </Button>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white border-2 border-black font-kalam">
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="space-y-6"
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-black flex items-center gap-2">
              <Mic className="h-5 w-5" />
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="text-gray-600">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>

          {/* Settings Section */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Voice Recognition Settings
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Language Selection */}
              <div className="space-y-2">
                <Label
                  htmlFor="language-select"
                  className="text-sm font-medium"
                >
                  Language
                </Label>
                <Select
                  value={selectedLanguage}
                  onValueChange={setSelectedLanguage}
                  disabled={isListening}
                >
                  <SelectTrigger className="border-2 border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          {lang.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* AssemblyAI Toggle */}
              <div className="space-y-2">
                <Label htmlFor="ai-toggle" className="text-sm font-medium">
                  Enhanced AI Recognition
                </Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="ai-toggle"
                    checked={useAssemblyAI}
                    onCheckedChange={setUseAssemblyAI}
                    disabled={isListening}
                  />
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Sparkles className="h-3 w-3" />
                    {useAssemblyAI ? "Premium Quality" : "Standard Quality"}
                  </div>
                </div>
              </div>
            </div>

            {useAssemblyAI && (
              <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border">
                ✨ Enhanced AI provides better accuracy and supports more
                languages
              </div>
            )}
          </div>

          {/* Voice Recording Status */}
          <div className="flex items-center justify-center space-y-4">
            <div className="relative flex items-center justify-center">
              {isListening && (
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 rounded-full border-4 border-blue-400"
                />
              )}
              <motion.div
                animate={
                  isListening
                    ? {
                        scale: [1, 1.05, 1],
                      }
                    : {}
                }
                transition={
                  isListening
                    ? {
                        duration: 0.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }
                    : {}
                }
                className={`
                  relative z-10 p-6 rounded-full border-2 border-black transition-colors duration-200
                  ${
                    isListening
                      ? "bg-red-500 text-white"
                      : hasStarted
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-black hover:bg-gray-200"
                  }
                `}
              >
                {isListening ? (
                  <MicOff className="h-8 w-8" />
                ) : (
                  <Mic className="h-8 w-8" />
                )}
              </motion.div>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex justify-center">
            <Badge
              variant={
                isListening
                  ? "destructive"
                  : isProcessing
                  ? "default"
                  : hasStarted
                  ? "default"
                  : "secondary"
              }
              className="text-sm py-1 px-3"
            >
              {isListening ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {useAssemblyAI ? "Recording..." : "Listening..."}
                </span>
              ) : isProcessing ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Processing with AI...
                </span>
              ) : hasStarted ? (
                <span className="flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Ready
                </span>
              ) : (
                "Click microphone to start"
              )}
            </Badge>
          </div>

          {/* Transcript Display */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-black">
                Transcript
              </label>
              <span
                className={`text-xs ${
                  getCharacterCount() > maxLength * 0.9
                    ? "text-red-500"
                    : "text-gray-500"
                }`}
              >
                {getCharacterCount()}/{maxLength}
              </span>
            </div>
            <Textarea
              value={getDisplayText()}
              onChange={(e) =>
                setTranscript(e.target.value.substring(0, maxLength))
              }
              placeholder={placeholder}
              className={`min-h-[100px] border-2 border-black resize-none ${
                interimTranscript ? "bg-blue-50" : "bg-white"
              }`}
              maxLength={maxLength}
            />
            {interimTranscript && (
              <p className="text-xs text-blue-600 italic">
                Processing: "{interimTranscript}"
              </p>
            )}
          </div>

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Alert className="border-red-300 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={isListening ? handleStopListening : handleStartListening}
              variant={isListening ? "destructive" : "default"}
              className="flex-1 border-2 border-black"
              disabled={!isSupported}
            >
              {isListening ? (
                <span className="flex items-center gap-2">
                  <MicOff className="h-4 w-4" />
                  Stop Recording
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  Start Recording
                </span>
              )}
            </Button>

            <Button
              onClick={handleClearTranscript}
              variant="outline"
              className="border-2 border-black"
              disabled={!transcript && !interimTranscript}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-2 border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              className="flex-1 bg-black text-white hover:bg-gray-800 border-2 border-black"
              disabled={!transcript.trim()}
            >
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Apply Text
              </span>
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>💡 Tip: Speak clearly and pause between sentences</p>
            <p>🎯 Best results with short, clear phrases</p>
            {useAssemblyAI && (
              <p>✨ Enhanced AI processing for better accuracy</p>
            )}
            {selectedLanguage === "hi" && (
              <p>🇮🇳 हिंदी में बोलें (Speak in Hindi)</p>
            )}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
