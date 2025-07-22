"use client"

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getLeagueTopScorers } from '@/api';
import Image from 'next/image';
import Link from 'next/link';

// League code mapping (same as in the league tables page)
const leagueMapping: {[key: string]: {name: string, code: string, emblem: string}} = {
  'premier-league': {
    name: 'Premier League',
    code: 'PL',
    emblem: '/img/leagues/premier_league.webp'
  },
  'la-liga': {
    name: 'La Liga',
    code: 'PD',
    emblem: '/img/leagues/laliga.svg'
  },
  'bundesliga': {
    name: 'Bundesliga',
    code: 'BL1',
    emblem: '/img/leagues/bundesliga.webp'
  },
  'serie-a': {
    name: 'Serie A',
    code: 'SA',
    emblem: '/img/leagues/serie_a.webp'
  },
  'ligue-1': {
    name: 'Ligue 1',
    code: 'FL1',
    emblem: '/img/leagues/ligue_1.webp'
  },
  'championship': {
    name: 'Championship',
    code: 'ELC',
    emblem: '/img/leagues/championship.webp'
  },
  'primeira-liga': {
    name: 'Primeira Liga',
    code: 'PPL',
    emblem: '/img/leagues/liga_portugal.webp'
  },
  'champions-league': {
    name: 'Champions League',
    code: 'CL',
    emblem: '/img/leagues/champions_league.webp'
  }
};

// Update the getPlayerImagePath function to use the correct file extension
function getPlayerImagePath(): string {
  // Return a static placeholder image for all players
  return '/img/placeholder-team.svg';
}

export default function TopScorersPage() {
  const params = useParams();
  const leagueSlug = params.league as string;
  
  const [scorers, setScorers] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchScorers = async () => {
      setIsLoading(true);
      setError(null);
      setIsRateLimited(false);
      
      if (!leagueSlug || !leagueMapping[leagueSlug]) {
        setError('League not found');
        setIsLoading(false);
        return;
      }
      
      try {
        // Use the server API route instead of direct API call
        const response = await fetch(`/api/scorers/${leagueSlug}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: `API error: ${response.status}` }));
          console.error('API error:', errorData);
          
          setError(errorData.error || 'Failed to load scorers data');
          setIsRateLimited(errorData.isRateLimited || false);
          
          setIsLoading(false);
          return;
        }
        
        const data = await response.json();
        
        if (!data) {
          throw new Error('No data received from API');
        }
        
        setScorers(data);
      } catch (err) {
        console.error('Error fetching scorers:', err);
        setError('Failed to load scorers. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchScorers();
    
    // Set up retry logic for rate limiting
    if (isRateLimited && retryCount < 3) {
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        fetchScorers();
      }, 60000); // Retry after 1 minute (football-data.org rate limit is per minute)
      
      return () => clearTimeout(timer);
    }
  }, [leagueSlug, retryCount]);

  if (error) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg">
        <h1 className="text-xl font-bold mb-4 text-red-500">Error</h1>
        <p className="mb-4">{error}</p>
        
        {isRateLimited && (
          <div className="mb-4 p-3 bg-yellow-900/50 border border-yellow-700 rounded-md">
            <p className="text-yellow-200 mb-2">API rate limit reached. The football data API limits the number of requests per minute.</p>
            <p className="text-sm text-gray-300">
              {retryCount > 0 
                ? `Retried ${retryCount} ${retryCount === 1 ? 'time' : 'times'}. Will retry again automatically in 1 minute.` 
                : 'Will retry automatically in 1 minute.'}
            </p>
          </div>
        )}
        
        <div className="flex flex-wrap space-x-4 mb-8">
          <Link href="/" className="text-teal-400 hover:text-teal-300">
            Return to matches
          </Link>
          
          <button 
            onClick={() => {
              setRetryCount(prev => prev + 1);
            }}
            className="text-blue-400 hover:text-blue-300"
          >
            Retry now
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !scorers) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg">
        <div className="mb-4">
          <h1 className="text-xl font-bold">Loading {leagueMapping[leagueSlug]?.name || ''} Top Scorers...</h1>
        </div>
        
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded mb-4 w-1/3"></div>
          <div className="h-4 bg-gray-700 rounded mb-2 w-1/4"></div>
          <div className="h-64 bg-gray-700 rounded-lg mt-6"></div>
        </div>
      </div>
    );
  }

  // Extract the league data
  const { name, emblem } = leagueMapping[leagueSlug];
  
  // Handle different API response structures
  let seasonName = '';
  let scorersData = [];
  
  if (scorers) {
    // Extract season name if available
    seasonName = scorers.season?.name || new Date().getFullYear().toString();
    
    // Get the scorers array
    scorersData = scorers.scorers || [];
  }
  
  // If we still don't have scorers data, show error
  if (!scorersData || scorersData.length === 0) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg">
        <h1 className="text-xl font-bold mb-4 text-red-500">No scorers available</h1>
        <p className="mb-4">The top scorers for this league are not currently available.</p>
        <div className="flex flex-wrap space-x-4">
          <Link href="/" className="text-teal-400 hover:text-teal-300">
            Return to matches
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{name} Top Scorers</h1>
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-teal-400 hover:text-teal-300 text-sm">
            Back to matches
          </Link>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700">
                <th className="px-4 py-2 text-left">Position</th>
                <th className="px-4 py-2 text-left">Player</th>
                <th className="px-4 py-2 text-left">Team</th>
                <th className="px-4 py-2 text-center">Goals</th>
                <th className="px-4 py-2 text-center">Assists</th>
                <th className="px-4 py-2 text-center">Minutes</th>
              </tr>
            </thead>
            <tbody>
              {scorersData.map((scorer: any, index: number) => (
                <tr key={scorer.player.id} className="border-t border-gray-700 hover:bg-gray-700/50">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center">
                      <div className="relative w-8 h-8 mr-2">
                        <Image
                          src={getPlayerImagePath()}
                          alt={scorer.player.name}
                          width={32}
                          height={32}
                          priority
                          unoptimized
                          className="rounded-full object-cover"
                          style={{ backgroundColor: '#2d3748' }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/img/placeholder-team.svg';
                          }}
                        />
                      </div>
                      <span>{scorer.player.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center">
                      <div className="relative w-6 h-6 mr-2">
                        <Image
                          src={scorer.team.crest}
                          alt={scorer.team.name}
                          width={24}
                          height={24}
                          className="object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/img/placeholder-team.svg';
                          }}
                        />
                      </div>
                      <span>{scorer.team.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-center">{scorer.goals}</td>
                  <td className="px-4 py-2 text-center">{scorer.assists}</td>
                  <td className="px-4 py-2 text-center">{scorer.minutes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Features section */}
      <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <h2 className="text-lg font-semibold mb-4">League Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            href={`/league-tables/${leagueSlug}`}
            className="flex flex-col items-center p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="font-medium">League Table</span>
            <span className="text-xs text-gray-400 mt-1">View the current standings</span>
          </Link>
          
          <div className="flex flex-col items-center p-4 bg-gray-700 rounded-lg cursor-not-allowed opacity-70">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-medium">Team Statistics</span>
            <span className="text-xs text-gray-400 mt-1">Coming soon</span>
          </div>
          
          <div className="flex flex-col items-center p-4 bg-gray-700 rounded-lg cursor-not-allowed opacity-70">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="font-medium">Form Guide</span>
            <span className="text-xs text-gray-400 mt-1">Coming soon</span>
          </div>
        </div>
      </div>
    </div>
  );
} 