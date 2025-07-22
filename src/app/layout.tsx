import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import FeaturedContent from '@/components/FeaturedContent'
import { Suspense } from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Football Info',
  description: 'Football matches information',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <main className='flex flex-col min-h-screen dark:bg-gray-900 dark:text-white'>
          <div className='container mx-auto px-4 xl:px-8 pb-8'>
            <Navbar />
            <section className='flex flex-col md:flex-row gap-4 mt-6'>
              <div className='md:flex-grow'>
                <Suspense fallback={<p>Loading...</p>}>
                  {children}
                </Suspense>
              </div>
              <div className='md:sticky md:top-4 md:self-start w-full md:w-64 lg:w-80 space-y-4'>
                <Sidebar />
                <FeaturedContent />
              </div>
            </section>
          </div>
        </main>
      </body>
    </html>
  )
}
