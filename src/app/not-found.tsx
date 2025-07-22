import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="px-4 py-8 md:px-6 md:py-16 flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl md:text-6xl font-bold text-teal-400 mb-4">404</h1>
      <h2 className="text-2xl md:text-3xl font-semibold mb-6">Page Not Found</h2>
      
      <p className="text-lg max-w-lg mb-8">
        The page you are looking for might have been removed or is temporarily unavailable.
      </p>
      
      <div className="mt-4">
        <Link href="/" className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-md font-medium transition-colors">
          Return to Home
        </Link>
      </div>
    </section>
  )
} 