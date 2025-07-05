"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Languages, ChevronDown, Globe, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface LanguageToggleProps {
  className?: string;
  variant?: "dropdown" | "toggle" | "compact";
  showIcon?: boolean;
  showText?: boolean;
}

const languages = [
  {
    code: "en" as const,
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
    shortCode: "EN",
  },
  {
    code: "hi" as const,
    name: "Hindi",
    nativeName: "हिन्दी",
    flag: "🇮🇳",
    shortCode: "हि",
  },
];

export function LanguageToggle({
  className,
  variant = "dropdown",
  showIcon = true,
  showText = true,
}: LanguageToggleProps) {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage =
    languages.find((lang) => lang.code === language) || languages[0];

  if (variant === "toggle") {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {languages.map((lang) => (
          <Button
            key={lang.code}
            variant={language === lang.code ? "default" : "outline"}
            size="sm"
            onClick={() => setLanguage(lang.code)}
            className={cn(
              "h-8 px-3 text-xs font-medium transition-all border-2 rounded-none",
              language === lang.code
                ? "bg-black text-white border-black"
                : "text-gray-600 hover:text-black hover:bg-gray-100 border-gray-300 hover:border-black"
            )}
          >
            {showIcon && <span className="mr-1">{lang.flag}</span>}
            {showText ? lang.shortCode : lang.flag}
          </Button>
        ))}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          const nextLang = language === "en" ? "hi" : "en";
          setLanguage(nextLang);
        }}
        className={cn(
          "h-8 w-8 p-0 rounded-full border-2 border-gray-200 hover:border-black transition-all",
          className
        )}
        title={t("navigation.language")}
      >
        <span className="text-sm">{currentLanguage.flag}</span>
      </Button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "rounded-none p-1 sm:p-2 text-sm hover:bg-gray-100 border-2 border-transparent hover:border-gray-300",
            className
          )}
        >
          {showIcon && <Globe className="h-4 w-4 mr-1" />}
          <span className="mr-1">{currentLanguage.flag}</span>
          {showText && (
            <span className="hidden sm:inline mr-1">
              {currentLanguage.shortCode}
            </span>
          )}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="font-kalam border-2 border-black rounded-none bg-white w-48">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => {
              setLanguage(lang.code);
              setIsOpen(false);
            }}
            className={cn(
              "cursor-pointer flex items-center justify-between px-3 py-2 hover:bg-gray-100",
              language === lang.code && "bg-blue-50"
            )}
          >
            <div className="flex items-center">
              <span className="mr-3 text-lg">{lang.flag}</span>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{lang.name}</span>
                <span className="text-xs text-gray-500">{lang.nativeName}</span>
              </div>
            </div>
            {language === lang.code && (
              <Check className="h-4 w-4 text-green-600" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
