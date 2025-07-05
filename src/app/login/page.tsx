"use client";

import { Separator } from "@/components/ui/separator";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Eye } from "lucide-react"; // For password visibility
import { useLanguage } from "@/contexts/LanguageContext";

export default function LoginPage() {
  const { t } = useLanguage();

  return (
    <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md p-8 border-2 border-black/10 rounded-lg bg-gray-50 space-y-6">
          <h1 className="text-3xl font-bold text-center">{t("login.title")}</h1>
          <form className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-lg">
                {t("login.email_label")}
              </Label>
              <Input
                type="email"
                id="email"
                placeholder={t("login.email_placeholder")}
                className="mt-1 border-2 border-black/20 rounded-none focus:border-blue-500 h-12 text-base"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-lg">
                {t("login.password_label")}
              </Label>
              <div className="relative">
                <Input
                  type={"password"}
                  id="password"
                  placeholder={t("login.password_placeholder")}
                  className="mt-1 border-2 border-black/20 rounded-none focus:border-blue-500 h-12 text-base pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                >
                  {/* <EyeOff size={20} /> or <Eye size={20} /> based on state */}
                  <Eye size={20} className="text-gray-500" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {/* <Checkbox id="remember-me" />
                <Label htmlFor="remember-me">Remember me</Label> */}
              </div>
              <Link
                href="#"
                className="font-medium text-blue-600 hover:underline"
              >
                {t("login.forgot_password")}
              </Link>
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full border-2 border-black rounded-none bg-yellow-400 hover:bg-yellow-500 text-black text-xl py-3"
            >
              {t("login.login_button")}
            </Button>
          </form>
          <Separator className="border-black/10" />
          <p className="text-center text-sm">
            {t("login.no_account")}{" "}
            <Link
              href="/signup"
              className="font-medium text-blue-600 hover:underline"
            >
              {t("login.signup_link")}
            </Link>
          </p>
          {/* Optional: Social Logins */}
        </div>
      </main>
      <Footer />
    </div>
  );
}
