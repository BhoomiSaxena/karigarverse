"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { LanguageToggle } from "@/components/language-toggle"
import { useLanguage } from "@/contexts/LanguageContext"
import { ProductCard } from "@/components/product-card"
import { 
  Globe, 
  CheckCircle, 
  Languages, 
  Users, 
  ShoppingBag, 
  Heart,
  MessageCircle,
  Star,
  ArrowRight
} from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { products } from "@/lib/data"

export default function LanguageSupportPage() {
  const { language, t } = useLanguage()
  const [selectedDemo, setSelectedDemo] = useState<'ui' | 'products' | 'navigation'>('ui')

  const demoProducts = products.slice(0, 3)

  const features = [
    {
      icon: Globe,
      titleKey: "language_support.realtime_switching",
      descKey: "language_support.realtime_switching_desc"
    },
    {
      icon: Users,
      titleKey: "language_support.local_community",
      descKey: "language_support.local_community_desc"
    },
    {
      icon: ShoppingBag,
      titleKey: "language_support.seamless_shopping",
      descKey: "language_support.seamless_shopping_desc"
    },
    {
      icon: Heart,
      titleKey: "language_support.cultural_preservation",
      descKey: "language_support.cultural_preservation_desc"
    }
  ]

  const testimonials = [
    {
      name: "प्रिया शर्मा",
      role: "कारीगर, उत्तराखंड",
      content: "हिंदी में डैशबोर्ड का होना बहुत सहायक है। अब मैं आसानी से अपने उत्पादों को प्रबंधित कर सकती हूं।",
      rating: 5
    },
    {
      name: "राजेश कुमार",
      role: "ग्राहक, दिल्ली",
      content: "अपनी भाषा में खरीदारी करना बहुत आसान हो गया है। कारीगर उत्पादों का चुनाव शानदार है।",
      rating: 5
    }
  ]

  return (
    <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-50 to-purple-50 py-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex justify-center mb-6">
                <Languages className="h-16 w-16 text-blue-500" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t('language_support.title')}
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                {t('language_support.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Badge variant="secondary" className="text-lg py-2 px-4">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                  {language === 'en' ? 'Currently: English' : 'वर्तमान: हिन्दी'}
                </Badge>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Switch Language:</span>
                  <LanguageToggle variant="toggle" />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Demo Selector */}
        <section className="py-8 px-4 border-b-2 border-gray-100">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                variant={selectedDemo === 'ui' ? 'default' : 'outline'}
                onClick={() => setSelectedDemo('ui')}
                className="border-2 border-black rounded-none"
              >
                {t('language_support.ui_elements')}
              </Button>
              <Button
                variant={selectedDemo === 'products' ? 'default' : 'outline'}
                onClick={() => setSelectedDemo('products')}
                className="border-2 border-black rounded-none"
              >
                {t('language_support.product_showcase')}
              </Button>
              <Button
                variant={selectedDemo === 'navigation' ? 'default' : 'outline'}
                onClick={() => setSelectedDemo('navigation')}
                className="border-2 border-black rounded-none"
              >
                {t('language_support.navigation_demo')}
              </Button>
            </div>
          </div>
        </section>

        {/* Demo Content */}
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            {selectedDemo === 'ui' && (
              <motion.div
                key="ui"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-4">{t('language_support.ui_elements')}</h2>
                  <p className="text-gray-600">{t('language_support.ui_elements_desc')}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <Card className="border-2 border-black rounded-none">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        {t('language_support.demo_card_title')}
                      </CardTitle>
                      <CardDescription>
                        {t('language_support.demo_card_desc')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>{t('navigation.home')}</span>
                          <Badge>{t('navigation.language')}</Badge>
                        </div>
                        <Separator />
                        <div className="text-sm text-gray-600">
                          {t('language_support.translation_quality')}
                        </div>
                        <Button className="w-full border-2 border-black rounded-none">
                          {t('home.subscribe')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-orange-200 rounded-none bg-orange-50">
                    <CardHeader>
                      <CardTitle className="text-orange-700">
                        {t('language_support.artisan_dashboard_preview')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between">
                          <span>{t('artisan.products')}:</span>
                          <span className="font-bold">24</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('artisan.orders')}:</span>
                          <span className="font-bold">18</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('artisan.notifications')}:</span>
                          <span className="font-bold">3</span>
                        </div>
                      </div>
                      <Link href="/artisan/dashboard">
                        <Button className="w-full bg-orange-500 hover:bg-orange-600 rounded-none">
                          {t('home.artisan_dashboard')}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {selectedDemo === 'products' && (
              <motion.div
                key="products"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-4">{t('language_support.product_showcase')}</h2>
                  <p className="text-gray-600">{t('language_support.product_showcase_desc')}</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {demoProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </div>

                <div className="text-center">
                  <Link href="/shop">
                    <Button size="lg" className="border-2 border-black rounded-none">
                      {t('home.view_all')} <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}

            {selectedDemo === 'navigation' && (
              <motion.div
                key="navigation"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-4">{t('language_support.navigation_demo')}</h2>
                  <p className="text-gray-600">{t('language_support.navigation_demo_desc')}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">{t('language_support.main_navigation')}</h3>
                    <div className="space-y-2">
                      {['home', 'shop', 'cart', 'orders', 'profile'].map((key) => (
                        <div key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                          <span>{t(`navigation.${key}` as any)}</span>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">{t('language_support.artisan_features')}</h3>
                    <div className="space-y-2">
                      {['dashboard', 'products', 'orders', 'profile', 'notifications'].map((key) => (
                        <div key={key} className="flex items-center justify-between p-3 border border-orange-200 rounded bg-orange-50">
                          <span>{t(`artisan.${key}` as any)}</span>
                          <ArrowRight className="h-4 w-4 text-orange-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t('language_support.features_title')}</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">{t('language_support.features_desc')}</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="text-center h-full border-2 border-black rounded-none">
                    <CardContent className="p-6">
                      <div className="flex justify-center mb-4">
                        <feature.icon className="h-12 w-12 text-blue-500" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{t(feature.titleKey as any)}</h3>
                      <p className="text-sm text-gray-600">{t(feature.descKey as any)}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t('language_support.testimonials_title')}</h2>
              <p className="text-gray-600">{t('language_support.testimonials_desc')}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <Card className="border-2 border-black rounded-none">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-gray-600">{testimonial.role}</div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 px-4 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">{t('language_support.cta_title')}</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              {t('language_support.cta_desc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/shop">
                <Button size="lg" className="border-2 border-black rounded-none">
                  {t('navigation.shop')}
                </Button>
              </Link>
              <Link href="/artisan/dashboard">
                <Button size="lg" variant="outline" className="border-2 border-black rounded-none">
                  {t('home.artisan_dashboard')}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
