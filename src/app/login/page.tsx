"use client";

import { Separator } from "@/components/ui/separator";
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
import { useDatabase } from "@/contexts/DatabaseContext";

export default function LoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { refreshProfile } = useDatabase();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (formData: FormData) => {
    setIsLoading(true);
    setError("");

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    console.log("Attempting login with:", { email, password: "***" });

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      console.log("Login response:", { status: response.status, result });

      if (!response.ok) {
        setError(result.error || "Login failed");
      } else {
        // Store the token
        localStorage.setItem("auth_token", result.token);
        console.log("Token stored, redirecting...");

        // Refresh the page to trigger the DatabaseContext to load the user
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Login error:", err);
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
          <h1 className="text-3xl font-bold text-center">Login</h1>
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
              {error}
            </div>
          )}
          <form action={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-lg">
                Email
              </Label>
              <Input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
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
                  placeholder="Enter your password"
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
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {/* Remember me checkbox */}
              </div>
              <Link
                href="#"
                className="font-medium text-blue-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="w-full border-2 border-black rounded-none bg-yellow-400 hover:bg-yellow-500 text-black text-xl py-3 disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <Separator className="border-black/10" />
          <p className="text-center text-sm">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-blue-600 hover:underline"
            >
              Sign up
            </Link>
          </p>
          {/* Optional: Social Logins */}
        </div>
      </main>
      <Footer />
    </div>
  );
}
