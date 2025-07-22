"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const RefreshButton = () => {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    
    // Refresh the current route
    router.refresh()
    
    // Reset the refresh state after a delay
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  return (
    <button 
      onClick={handleRefresh}
      disabled={isRefreshing}
      className={`p-2 rounded-md ${isRefreshing ? 'bg-slate-700' : 'bg-slate-600 hover:bg-slate-500'} transition-colors`}
      title="Refresh data"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-teal-400' : 'text-white'}`} 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    </button>
  )
}

export default RefreshButton 