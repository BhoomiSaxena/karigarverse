"use client";

import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

export default function SignupPage() {
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  return (
    <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md p-8 border-2 border-black/10 rounded-lg bg-gray-50 space-y-6">
          <h1 className="text-3xl font-bold text-center">{t("signup.title")}</h1>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-lg">
                  {t("signup.first_name_label")}
                </Label>
                <Input
                  type="text"
                  id="firstName"
                  placeholder={t("signup.first_name_placeholder")}
                  className="mt-1 border-2 border-black/20 rounded-none focus:border-blue-500 h-12 text-base"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-lg">
                  {t("signup.last_name_label")}
                </Label>
                <Input
                  type="text"
                  id="lastName"
                  placeholder={t("signup.last_name_placeholder")}
                  className="mt-1 border-2 border-black/20 rounded-none focus:border-blue-500 h-12 text-base"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email" className="text-lg">
                {t("signup.email_label")}
              </Label>
              <Input
                type="email"
                id="email"
                placeholder={t("signup.email_placeholder")}
                className="mt-1 border-2 border-black/20 rounded-none focus:border-blue-500 h-12 text-base"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-lg">
                {t("signup.phone_label")}
              </Label>
              <Input
                type="tel"
                id="phone"
                placeholder={t("signup.phone_placeholder")}
                className="mt-1 border-2 border-black/20 rounded-none focus:border-blue-500 h-12 text-base"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-lg">
                {t("signup.password_label")}
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder={t("signup.password_placeholder")}
                  className="mt-1 border-2 border-black/20 rounded-none focus:border-blue-500 h-12 text-base pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                >
                  {showPassword ? (
                    <EyeOff size={20} className="text-gray-500" />
                  ) : (
                    <Eye size={20} className="text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-lg">
                {t("signup.confirm_password_label")}
              </Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  placeholder={t("signup.confirm_password_placeholder")}
                  className="mt-1 border-2 border-black/20 rounded-none focus:border-blue-500 h-12 text-base pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} className="text-gray-500" />
                  ) : (
                    <Eye size={20} className="text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                className="mt-1"
              />
              <Label htmlFor="terms" className="text-sm leading-relaxed">
                {t("signup.terms_agreement")}{" "}
                <Link
                  href="/terms"
                  className="font-medium text-blue-600 hover:underline"
                >
                  {t("signup.terms_link")}
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="font-medium text-blue-600 hover:underline"
                >
                  {t("signup.privacy_link")}
                </Link>
              </Label>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={!agreedToTerms}
              className="w-full border-2 border-black rounded-none bg-yellow-400 hover:bg-yellow-500 text-black text-xl py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("signup.signup_button")}
            </Button>
          </form>
          
          <Separator className="border-black/10" />
          
          <p className="text-center text-sm">
            {t("signup.already_have_account")}{" "}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:underline"
            >
              {t("signup.login_link")}
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
