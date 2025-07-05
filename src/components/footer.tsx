"use client";

import Link from "next/link";
import { Palette, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-50 font-kalam text-black border-t-2 border-black py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">
              {t("footer.get_to_know_us")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="hover:underline">
                  {t("footer.about_us")}
                </Link>
              </li>
              <li>
                <Link href="/mission" className="hover:underline">
                  {t("footer.our_mission")}
                </Link>
              </li>
              <li>
                <Link href="/language-support" className="hover:underline">
                  {t("footer.language_support")}
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:underline">
                  {t("footer.careers")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">
              {t("footer.connect_with_us")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="mailto:info@localartisans.com"
                  className="hover:underline"
                >
                  {t("footer.email_us")}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  {t("footer.facebook")}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  {t("footer.instagram")}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  {t("footer.twitter")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">
              {t("footer.sell_with_us")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/sell" className="hover:underline">
                  {t("footer.become_artisan")}
                </Link>
              </li>
              <li>
                <Link href="/seller-portal" className="hover:underline">
                  {t("footer.seller_portal")}
                </Link>
              </li>
              <li>
                <Link href="/guidelines" className="hover:underline">
                  {t("footer.guidelines")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">
              {t("footer.help_support")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className="hover:underline">
                  {t("footer.faq")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:underline">
                  {t("footer.contact_support")}
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:underline">
                  {t("footer.shipping_returns")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t-2 border-black/20 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm">
          <div className="flex items-center gap-2 mb-4 sm:mb-0">
            <Palette className="h-6 w-6 text-blue-500" />
            <span>
              {t("footer.copyright", { year: new Date().getFullYear() })}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="rounded-none p-1 text-sm hover:bg-gray-100"
                >
                  <img
                    src="/placeholder.svg?width=20&height=15&text=IN"
                    alt="India Flag"
                    className="w-5 h-auto mr-2"
                  />{" "}
                  {t("footer.country_india")}{" "}
                  <ChevronDown className="h-4 w-4 inline ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="font-kalam border-2 border-black rounded-none bg-white">
                <DropdownMenuItem>{t("footer.country_india")}</DropdownMenuItem>
                {/* Add other countries */}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="rounded-none p-1 text-sm hover:bg-gray-100"
                >
                  {t("footer.language_english")}{" "}
                  <ChevronDown className="h-4 w-4 inline ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="font-kalam border-2 border-black rounded-none bg-white">
                <DropdownMenuItem>
                  {t("footer.language_english")}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  {t("footer.language_hindi")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </footer>
  );
}
