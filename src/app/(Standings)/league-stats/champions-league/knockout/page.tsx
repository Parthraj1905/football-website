"use client"

import { useEffect, useState } from 'react';
import { getChampionsLeagueKnockoutMatches } from '@/api';
import KnockoutStage from '@/components/KnockoutStage';
import Link from 'next/link';

export default function ChampionsLeagueKnockoutPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setIsLoading(true);
        const data = await getChampionsLeagueKnockoutMatches();
        
        if (!data) {
          throw new Error('Failed to fetch knockout stage matches');
        }
        
        setMatches(data);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load Champions League knockout stage matches');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMatches();
  }, []);

  if (error) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg">
        <h1 className="text-xl font-bold mb-4 text-red-500">Error</h1>
        <p className="mb-4">{error}</p>
        <Link href="/" className="text-teal-400 hover:text-teal-300">
          Return to home page
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg">
        <h1 className="text-xl font-bold mb-4">Loading Champions League Knockout Stage...</h1>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded mb-4 w-1/3"></div>
          <div className="h-4 bg-gray-700 rounded mb-2 w-1/4"></div>
          <div className="h-64 bg-gray-700 rounded-lg mt-6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Champions League Knockout Stage</h1>
        <div className="flex items-center space-x-4">
          <Link href="/league-tables/champions-league" className="text-teal-400 hover:text-teal-300 text-sm">
            View League Table
          </Link>
          <Link href="/league-stats/champions-league/scorers" className="text-teal-400 hover:text-teal-300 text-sm">
            View Top Scorers
          </Link>
          <Link href="/" className="text-teal-400 hover:text-teal-300 text-sm">
            Back to matches
          </Link>
        </div>
      </div>
      
      <KnockoutStage matches={matches} />
    </div>
  );
} 