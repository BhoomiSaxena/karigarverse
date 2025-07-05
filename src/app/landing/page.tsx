"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Palette,
  Menu,
  X,
  Star,
  MapPin,
  Instagram,
  Facebook,
  Twitter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { featuredCategories, testimonials } from "@/lib/data";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();

  const navItems = [
    { href: "#home", label: t("landing.nav.home") },
    { href: "#about", label: t("landing.nav.about") },
    { href: "#crafts", label: t("landing.nav.crafts") },
    { href: "#contact", label: t("landing.nav.contact") },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Loader */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 bg-gray-900 z-50 flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            >
              <Palette className="w-12 h-12 text-orange-500" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-gray-900 text-white font-kalam">
        {/* Hero Section */}
        <section id="home" className="relative min-h-screen flex flex-col">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/hero-bg.jpg"
              alt="Artisan workspace"
              fill
              className="object-cover brightness-[0.45] grayscale-[0.2]"
              priority
            />
          </div>

          {/* Navigation */}
          <nav className="relative z-10 flex justify-between items-center p-4 md:p-8 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold text-orange-500 tracking-wider">
                AM
              </div>
            </div>

            {/* Desktop Navigation */}
            <ul className="hidden md:flex gap-8">
              {navItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-white hover:text-orange-400 transition-colors font-semibold"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-orange-500 text-2xl"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>

            {/* Mobile Navigation */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute top-full left-0 right-0 bg-gray-900/98 backdrop-blur-sm border-b border-gray-700 md:hidden"
                >
                  <ul className="flex flex-col p-4 gap-4">
                    {navItems.map((item) => (
                      <li key={item.href}>
                        <a
                          href={item.href}
                          className="text-white hover:text-orange-400 transition-colors font-semibold block py-2"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </nav>

          {/* Hero Content */}
          <div className="relative z-10 flex-1 flex items-center justify-center text-center px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <h1 className="text-6xl md:text-8xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 stroke-orange-500 stroke-1">
                ARTISAN MARKETPLACE
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8">
                Every piece tells a story
              </p>
              <Link href="/shop">
                <Button
                  size="lg"
                  className="bg-orange-500 hover:bg-orange-600 text-gray-900 font-bold px-8 py-3 text-lg rounded-md transition-colors"
                >
                  Explore Our Crafts
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-4xl font-bold text-orange-500 mb-6">
                  {t("landing.about_title")}
                </h2>
                <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                  {t("landing.about_desc_1")}
                </p>
                <p className="text-lg text-gray-300 leading-relaxed">
                  {t("landing.about_desc_2")}
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="flex justify-center"
              >
                <Image
                  src="/images/about-artisan.jpg"
                  alt="Artisan at work"
                  width={400}
                  height={500}
                  className="rounded-2xl shadow-2xl border-4 border-orange-500"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Featured Crafts Section */}
        <section id="crafts" className="py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-bold text-orange-500 text-center mb-12"
            >
              Our Featured Crafts
            </motion.h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredCategories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group perspective-1000"
                >
                  <div className="relative h-80 transform-style-preserve-3d transition-transform duration-700 group-hover:rotate-y-180">
                    {/* Front of card */}
                    <div className="absolute inset-0 backface-hidden bg-gray-800 rounded-2xl p-6 flex flex-col items-center justify-center border border-gray-700 shadow-xl">
                      <Image
                        src={category.image || "/placeholder.svg"}
                        alt={category.name}
                        width={100}
                        height={100}
                        className="rounded-full mb-4 border-4 border-orange-500 object-cover"
                      />
                      <h3 className="text-xl font-bold text-white mb-2">
                        {category.name}
                      </h3>
                      <p className="text-orange-500 font-bold text-lg">
                        {category.price}
                      </p>
                      <Button className="mt-4 bg-orange-500 hover:bg-orange-600 text-gray-900 font-bold">
                        View Collection
                      </Button>
                    </div>
                    {/* Back of card */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gray-800 rounded-2xl p-6 flex flex-col items-center justify-center border border-gray-700 shadow-xl">
                      <p className="text-gray-300 text-center">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 px-4 md:px-8 bg-gray-800/50">
          <div className="max-w-6xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-bold text-orange-500 text-center mb-12"
            >
              {t("landing.testimonials_title")}
            </motion.h2>
            <div className="relative overflow-hidden h-48 rounded-2xl border-4 border-orange-500 bg-gray-900">
              <div className="flex animate-scroll-left">
                {[...testimonials, ...testimonials].map(
                  (testimonial, index) => (
                    <div
                      key={`${testimonial.id}-${index}`}
                      className="flex-shrink-0 w-80 h-48 bg-gray-800 rounded-2xl p-6 mx-4 flex flex-col justify-center items-center border border-gray-700 shadow-lg"
                    >
                      <p className="text-gray-300 text-center mb-4">
                        "{testimonial.text}"
                      </p>
                      <div className="text-orange-500 font-bold">
                        — {testimonial.name}
                      </div>
                      <div className="flex text-orange-500 mt-2">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-4xl font-bold text-orange-500 mb-8 text-center md:text-left">
                  {t("landing.contact_title")}
                </h2>
                <form className="space-y-6">
                  <Input
                    type="text"
                    placeholder={t("landing.contact_name")}
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500"
                    required
                  />
                  <Input
                    type="email"
                    placeholder={t("landing.contact_email")}
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500"
                    required
                  />
                  <Textarea
                    placeholder={t("landing.contact_message")}
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 min-h-32"
                    required
                  />
                  <Button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-gray-900 font-bold py-3"
                  >
                    {t("landing.send_message")}
                  </Button>
                </form>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="flex justify-center items-start"
              >
                <div className="w-full max-w-md h-80 bg-gray-800 rounded-2xl border-4 border-orange-500 shadow-2xl flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                    <p className="text-gray-300">Visit our artisan workshops</p>
                    <p className="text-gray-400 text-sm mt-2">
                      Uttrakhand, India
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 border-t-2 border-gray-700 py-8 px-4 md:px-8">
          <div className="max-w-6xl mx-auto text-center">
            <div className="flex flex-col items-center gap-4">
              <span className="text-gray-300">
                © 2025 Artisan Marketplace. All rights reserved.
              </span>
              <div className="flex gap-6">
                <a
                  href="#"
                  className="text-orange-500 hover:text-white transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="text-orange-500 hover:text-white transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="text-orange-500 hover:text-white transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll-left {
          animation: scroll-left 30s linear infinite;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </>
  );
}
