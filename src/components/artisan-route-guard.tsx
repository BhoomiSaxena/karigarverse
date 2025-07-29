"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDatabase } from "@/contexts/DatabaseContext";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

interface ArtisanRouteGuardProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

/**
 * Component to protect artisan routes and redirect to onboarding if needed
 */
export function ArtisanRouteGuard({
  children,
  fallbackPath = "/artisan/onboarding",
}: ArtisanRouteGuardProps) {
  const { user, loading, isArtisan } = useDatabase();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && !isArtisan) {
      router.push(fallbackPath);
    }
  }, [user, loading, isArtisan, router, fallbackPath]);

  // Still loading
  if (loading) {
    return (
      <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-lg">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // User not authenticated
  if (!user) {
    return (
      <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">
              Please log in to access artisan features.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // User authenticated but not an artisan (redirecting)
  if (!isArtisan) {
    return (
      <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-lg">Redirecting to artisan onboarding...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // User is authenticated and is an artisan
  return <>{children}</>;
}
