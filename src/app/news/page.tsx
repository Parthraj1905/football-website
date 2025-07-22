import { getNewsInfo } from "@/api"
import { newsType } from "@/types"
import Image from "next/image"
import Link from "next/link"

export const metadata = {
  title: 'Football News - Latest Soccer Headlines',
  description: 'Stay updated with the latest football news, transfers, match reports, and player interviews.',
}

export default async function NewsPage() {
  const getNews = await getNewsInfo()
  const newsData = getNews?.articles || []
  
  return (
    <section className="px-2 md:px-4 md:w-[600px]">
      <h1 className="text-2xl font-bold mb-6">Latest Football News</h1>
      
      {newsData.length === 0 ? (
        <div className="p-6 bg-[rgb(40,46,58)] rounded-md text-center">
          <p className="text-lg text-gray-400 mb-2">No news articles available</p>
          <p className="text-sm text-gray-500">Please check back later for updates</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {newsData.map((article: newsType, index: number) => (
            <div key={`${article.title}-${index}`} className="bg-[rgb(40,46,58)] rounded-md overflow-hidden">
              <div className="relative h-48 md:h-64 w-full">
                <Image 
                  src={article?.urlToImage != null ? article.urlToImage : '/img/news-football.webp'} 
                  alt={article.title} 
                  fill 
                  className="object-cover" 
                />
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{article.title}</h2>
                <p className="text-gray-400 mb-4 text-sm line-clamp-3">
                  {article.description || 'No description available'}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {article.source?.name || 'Unknown source'}
                    {article.publishedAt && ` • ${new Date(article.publishedAt).toLocaleDateString()}`}
                  </span>
                  <Link href={article.url} className="bg-teal-600 hover:bg-teal-700 text-white text-sm py-1 px-3 rounded transition-colors" target="_blank" rel="noopener noreferrer">
                    Read More
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
} 