"use client";
import Image from "next/image";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { useEffect, useCallback, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export function HeroCarousel() {
  const [api, setApi] = useState<CarouselApi>();
  const { t } = useLanguage();

  const heroItems = [
    {
      id: 1,
      titleKey: "hero_carousel.textile_title",
      descriptionKey: "hero_carousel.textile_description",
      image: "/images/textiles-1.jpg",
      link: "/shop?category=textiles",
    },
    {
      id: 2,
      titleKey: "hero_carousel.pottery_title",
      descriptionKey: "hero_carousel.pottery_description", 
      image: "/images/pottery-1.jpg",
      link: "/shop?category=pottery",
    },
    {
      id: 3,
      titleKey: "hero_carousel.jewelry_title",
      descriptionKey: "hero_carousel.jewelry_description",
      image: "/images/jewelry-1.jpg",
      link: "/shop?category=jewelry",
    },
  ];

  // Custom autoplay implementation
  const autoplay = useCallback(() => {
    if (api) {
      api.scrollNext();
    }
  }, [api]);

  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      autoplay();
    }, 5000); // 5 second delay

    return () => clearInterval(interval);
  }, [api, autoplay]);

  return (
    <Carousel opts={{ loop: true }} setApi={setApi} className="w-full mb-12">
      <CarouselContent>
        {heroItems.map((item) => (
          <CarouselItem key={item.id}>
            <div className="relative aspect-[16/7] md:aspect-[16/6] lg:aspect-[16/5] w-full">
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.title}
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center p-4">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-md">
                  {t(item.titleKey)}
                </h2>
                <p className="text-lg sm:text-xl text-gray-200 mb-6 max-w-2xl drop-shadow-sm">
                  {t(item.descriptionKey)}
                </p>
                <Link href={item.link}>
                  <Button
                    size="lg"
                    className="border-2 border-white bg-transparent hover:bg-white hover:text-black text-white rounded-none text-lg px-8 py-3"
                  >
                    {t("hero_carousel.shop_now")}
                  </Button>
                </Link>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/50 hover:bg-white text-black border-2 border-black rounded-none h-10 w-10 sm:h-12 sm:w-12" />
      <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/50 hover:bg-white text-black border-2 border-black rounded-none h-10 w-10 sm:h-12 sm:w-12" />
    </Carousel>
  );
}
