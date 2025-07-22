"use client"

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getLeagueStandings, getServerStandings } from '@/api';
import LeagueStandings from '@/components/LeagueStandings';
import Link from 'next/link';
import Image from 'next/image';

// League code mapping
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

interface TeamStanding {
  position: number;
  team: {
    id: number;
    name: string;
    shortName?: string;
    crest: string;
  };
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  form?: string;
}

export default function LeagueTablePage() {
  const params = useParams();
  const leagueSlug = params.league as string;
  
  const [standings, setStandings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStandings = async () => {
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
        const response = await fetch(`/api/standings/${leagueSlug}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: `API error: ${response.status}` }));
          console.error('API error:', errorData);
          
          setError(errorData.error || 'Failed to load standings data');
          setIsRateLimited(errorData.isRateLimited || false);
          
          setIsLoading(false);
          return;
        }
        
        const data = await response.json();
        
        if (!data) {
          throw new Error('No data received from API');
        }
        
        // Log the data structure for debugging
        console.log('API response:', data);
        
        setStandings(data);
      } catch (err) {
        console.error('Error fetching standings:', err);
        setError('Failed to load standings. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStandings();
    
    // Set up retry logic for rate limiting
    if (isRateLimited && retryCount < 3) {
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        fetchStandings();
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

  if (isLoading || !standings) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg">
        <div className="mb-4">
          <h1 className="text-xl font-bold">Loading {leagueMapping[leagueSlug]?.name || ''} Table...</h1>
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
  let tableData: TeamStanding[] = [];
  
  if (standings && standings.standings) {
    // Format for most leagues with multiple tables (e.g. group stages)
    seasonName = standings.season?.startDate 
      ? `${new Date(standings.season.startDate).getFullYear()}-${new Date(standings.season.endDate).getFullYear()}`
      : '';
      
    // Get either the first standings table or total standings if available
    const totalTable = standings.standings.find((table: any) => table.type === 'TOTAL');
    if (totalTable) {
      tableData = totalTable.table || [];
    } else if (standings.standings.length > 0 && standings.standings[0].table) {
      tableData = standings.standings[0].table;
    }
  } else if (standings && standings.table) {
    // Direct table format
    tableData = standings.table;
    seasonName = standings.season || '';
  }
  
  // If we still don't have table data, show error
  if (!tableData || tableData.length === 0) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg">
        <h1 className="text-xl font-bold mb-4 text-red-500">No standings available</h1>
        <p className="mb-4">The standings for this league are not currently available.</p>
        <div className="flex flex-wrap space-x-4">
          <Link href="/" className="text-teal-400 hover:text-teal-300">
            Return to home page
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{name} Table</h1>
        <Link href="/" className="text-teal-400 hover:text-teal-300 text-sm flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Back to Matches
        </Link>
      </div>
      
      {/* Team search input */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search team..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            ×
          </button>
        )}
      </div>
      
      <LeagueStandings 
        standings={tableData.filter((team: TeamStanding) => 
          !searchTerm || 
          team.team.name.toLowerCase().includes(searchTerm.toLowerCase())
        )}
        leagueName={name}
        leagueEmblem={emblem}
        season={seasonName}
        isLoading={isLoading}
      />
      
      {/* Quick Stats and Competition Links - now below the table */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-6">League Statistics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
            <div className="text-sm text-gray-400 mb-1">Total Teams</div>
            <div className="text-2xl font-bold">{tableData.length}</div>
          </div>
          
          <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
            <div className="text-sm text-gray-400 mb-1">Current Matchday</div>
            <div className="text-2xl font-bold">
              {standings.season?.currentMatchday || 
               Math.max(...tableData.map(team => team.playedGames || 0))}
            </div>
          </div>
          
          <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
            <div className="text-sm text-gray-400 mb-1">Average Goals</div>
            <div className="text-2xl font-bold">
              {(tableData.reduce((sum: number, team: TeamStanding) => sum + (team.goalsFor || 0), 0) / 
                (tableData.length || 1)).toFixed(1)}
            </div>
          </div>
          
          <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
            <div className="text-sm text-gray-400 mb-1">Total Matches</div>
            <div className="text-2xl font-bold">
              {Math.max(...tableData.map(team => team.playedGames || 0)) * tableData.length / 2}
            </div>
          </div>
          
          <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
            <div className="text-sm text-gray-400 mb-1">Total Goals</div>
            <div className="text-2xl font-bold">
              {tableData.reduce((sum: number, team: TeamStanding) => sum + (team.goalsFor || 0), 0)}
            </div>
          </div>
        </div>
        
        {/* Competition Links */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="text-sm text-gray-400 mb-3">Competition Links</div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/league-stats/${leagueSlug}/scorers`}
              className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Top Scorers
            </Link>
            {leagueSlug === 'champions-league' && (
              <Link href={`/league-stats/champions-league/knockout`}
                className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Knockout Stage
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 