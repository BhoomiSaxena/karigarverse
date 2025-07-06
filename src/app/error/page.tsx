import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function ErrorPage() {
  return (
    <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="text-6xl">⚠️</div>
          <h1 className="text-3xl font-bold">Authentication Error</h1>
          <p className="text-lg text-gray-600">
            Sorry, there was an issue with your authentication. This could be due to:
          </p>
          <ul className="text-left text-gray-600 space-y-2">
            <li>• Expired or invalid confirmation link</li>
            <li>• Link has already been used</li>
            <li>• Network connectivity issues</li>
          </ul>
          <div className="space-y-4">
            <Button asChild className="w-full border-2 border-black rounded-none bg-yellow-400 hover:bg-yellow-500 text-black">
              <Link href="/login">Try Logging In</Link>
            </Button>
            <Button asChild variant="outline" className="w-full border-2 border-black rounded-none">
              <Link href="/signup">Create New Account</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
