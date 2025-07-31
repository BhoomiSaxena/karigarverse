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
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignup = async (formData: FormData) => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;

    // Basic validation
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setIsLoading(false);
      return;
    }

    if (!agreedToTerms) {
      setError("Please agree to the terms and conditions");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Registration failed");
      } else {
        setSuccess("Account created successfully! You can now log in.");
        // Redirect to login after a delay
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md p-8 border-2 border-black/10 rounded-lg bg-gray-50 space-y-6">
          <h1 className="text-3xl font-bold text-center">Sign Up</h1>
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded">
              {success}
            </div>
          )}
          <form action={handleSignup} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-lg">
                  First Name
                </Label>
                <Input
                  type="text"
                  id="firstName"
                  name="firstName"
                  placeholder="John"
                  required
                  className="mt-1 border-2 border-black/20 rounded-none focus:border-blue-500 h-12 text-base"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-lg">
                  Last Name
                </Label>
                <Input
                  type="text"
                  id="lastName"
                  name="lastName"
                  placeholder="Doe"
                  required
                  className="mt-1 border-2 border-black/20 rounded-none focus:border-blue-500 h-12 text-base"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-lg">
                Email
              </Label>
              <Input
                type="email"
                id="email"
                name="email"
                placeholder="john@example.com"
                required
                className="mt-1 border-2 border-black/20 rounded-none focus:border-blue-500 h-12 text-base"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-lg">
                Password
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Create a password"
                  required
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
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  required
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
                onCheckedChange={(checked) =>
                  setAgreedToTerms(checked as boolean)
                }
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
