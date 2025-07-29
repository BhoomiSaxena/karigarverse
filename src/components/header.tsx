"use client";
import Link from "next/link";
import {
  Palette,
  Search,
  ShoppingCart,
  UserCircle,
  Package,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDatabase } from "@/contexts/DatabaseContext";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { ClientOnly } from "@/components/client-only";

export function Header() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user: dbUser, loading: dbLoading, isArtisan } = useDatabase();
  const [isSticky, setIsSticky] = useState(false);
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 60); // Adjust threshold as needed
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header
      className={cn(
        "bg-white font-kalam text-black border-b-2 border-black transition-all duration-300",
        isSticky ? "fixed top-0 left-0 right-0 z-50 shadow-md" : "relative"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-2" prefetch={false}>
            <div className="border-2 border-black p-1">
              <Palette className="h-8 w-8 text-blue-500" />
            </div>
            <span className="text-2xl font-bold hidden sm:inline">
              KarigarVerse
            </span>
          </Link>

          {/* Center: Search Bar */}
          <div className="flex-1 max-w-xl mx-4 hidden md:block">
            <div className="relative">
              <Input
                type="search"
                placeholder={t("navigation.search_placeholder")}
                className="w-full pl-10 pr-4 py-2 border-2 border-black rounded-none focus:ring-0 focus:border-blue-500"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Right: Icons & Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <LanguageToggle />
            <ClientOnly
              fallback={
                <span className="text-xs sm:text-sm hidden lg:inline animate-pulse bg-gray-200 h-4 w-24 rounded"></span>
              }
            >
              <span className="text-xs sm:text-sm hidden lg:inline">
                {t("navigation.deliver_to")}{" "}
                <span className="font-bold">Uttrakhand</span>
              </span>
            </ClientOnly>

            <Link
              href="/cart"
              className="p-1 sm:p-2 hover:bg-gray-100 rounded-full"
              aria-label={t("navigation.cart")}
            >
              <ShoppingCart className="h-6 w-6" />
            </Link>

            {/* Auth-dependent UI */}
            {loading ? (
              <div className="h-6 w-6 animate-pulse bg-gray-200 rounded-full" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="p-1 sm:p-2 hover:bg-gray-100 rounded-full flex items-center gap-1">
                  <UserCircle className="h-6 w-6" />
                  <ChevronDown className="h-4 w-4 hidden sm:block" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {user.user_metadata?.full_name || user.email}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders">My Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/artisan/check">Artisan Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-red-600"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link
                  href="/login"
                  className="p-1 sm:p-2 hover:bg-gray-100 rounded-full"
                  aria-label={t("navigation.login")}
                >
                  <UserCircle className="h-6 w-6" />
                </Link>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="hidden sm:inline-flex border-2 border-black rounded-none"
                >
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}

            <Link
              href="/orders"
              className="p-1 sm:p-2 hover:bg-gray-100 rounded-full"
              aria-label={t("navigation.orders")}
            >
              <Package className="h-6 w-6" />
            </Link>
          </div>
        </div>
        {/* Search bar for mobile - shown below main nav items */}
        <div className="md:hidden py-2 px-1">
          <div className="relative">
            <Input
              type="search"
              placeholder={t("navigation.mobile_search_placeholder")}
              className="w-full pl-10 pr-4 py-2 border-2 border-black rounded-none focus:ring-0 focus:border-blue-500"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>
    </header>
  );
}
