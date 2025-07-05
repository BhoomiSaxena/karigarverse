"use client"

import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Languages, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LanguageToggleProps {
  className?: string
  variant?: 'dropdown' | 'toggle'
}

export function LanguageToggle({ className, variant = 'dropdown' }: LanguageToggleProps) {
  const { language, setLanguage, t } = useLanguage()

  if (variant === 'toggle') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Button
          variant={language === 'en' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setLanguage('en')}
          className="text-xs"
        >
          EN
        </Button>
        <Button
          variant={language === 'hi' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setLanguage('hi')}
          className="text-xs"
        >
          हि
        </Button>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className={cn("rounded-none p-1 sm:p-2 text-sm hover:bg-gray-100", className)}
        >
          <Languages className="h-4 w-4 mr-1" />
          {language === 'en' ? 'EN' : 'हि'}
          <ChevronDown className="h-4 w-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="font-kalam border-2 border-black rounded-none bg-white">
        <DropdownMenuItem 
          onClick={() => setLanguage('en')}
          className={cn(
            "cursor-pointer",
            language === 'en' && "bg-blue-50 font-semibold"
          )}
        >
          <span className="mr-2">🇺🇸</span>
          {t('navigation.english')}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLanguage('hi')}
          className={cn(
            "cursor-pointer",
            language === 'hi' && "bg-blue-50 font-semibold"
          )}
        >
          <span className="mr-2">🇮🇳</span>
          {t('navigation.hindi')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
