"use client"

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getLiveMatches, getTodayMatches } from '@/api';
import { matchesType } from '@/types';

interface FeaturedContentProps {
  liveMatches?: matchesType[];
  upcomingMatches?: matchesType[];
}

// Helper function to create placeholder loading skeleton
const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-3">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex items-center bg-gray-800 p-3 rounded-md">
        <div className="w-8 h-8 bg-gray-700 rounded-full mr-3"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          <div className="h-3 bg-gray-700 rounded w-1/2 mt-2"></div>
        </div>
        <div className="w-10 h-10 bg-gray-700 rounded"></div>
      </div>
    ))}
  </div>
);

const FeaturedContent: React.FC<FeaturedContentProps> = ({
  liveMatches: initialLiveMatches,
  upcomingMatches: initialUpcomingMatches,
}) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'live' | 'dashboard'>('upcoming');
  const [liveMatches, setLiveMatches] = useState<matchesType[]>(initialLiveMatches || []);
  const [upcomingMatches, setUpcomingMatches] = useState<matchesType[]>(initialUpcomingMatches || []);
  const [isLoading, setIsLoading] = useState(!initialLiveMatches || !initialUpcomingMatches);
  const [favoriteTeams, setFavoriteTeams] = useState<string[]>([
    'Manchester United', 'Barcelona', 'Liverpool'
  ]);
  const [favoriteLeagues, setFavoriteLeagues] = useState<string[]>([
    'Premier League', 'La Liga', 'Champions League'
  ]);

  // Fetch match data if not provided as props
  useEffect(() => {
    if (!initialLiveMatches || !initialUpcomingMatches) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [liveMatches, todayMatches] = await Promise.all([
            getLiveMatches(),
            getTodayMatches()
          ]);
          
          setLiveMatches(liveMatches?.matches || []);
          
          // Filter today's matches to get upcoming ones
          const upcoming = todayMatches ? todayMatches.filter((match: matchesType) => 
            match.status !== 'FINISHED' && match.status !== 'IN_PLAY'
          ) : [];
          setUpcomingMatches(upcoming);
        } catch (error) {
          console.error('Error fetching match data:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchData();
      
      // Refresh live data every 60 seconds
      const interval = setInterval(() => {
        if (activeTab === 'live') {
          getLiveMatches().then(data => {
            if (data) setLiveMatches(data.matches || []);
          });
        }
      }, 60000);
      
      return () => clearInterval(interval);
    }
  }, [initialLiveMatches, initialUpcomingMatches, activeTab]);

  // Filter to important upcoming matches (simplistic implementation)
  const importantUpcomingMatches = upcomingMatches
    .filter(match => {
      // Filter based on popular teams or leagues
      const isPopularTeam = 
        (match.homeTeam?.name && favoriteTeams.some(team => match.homeTeam.name.includes(team))) ||
        (match.awayTeam?.name && favoriteTeams.some(team => match.awayTeam.name.includes(team)));
      
      const isPopularLeague = 
        match.competition?.name && favoriteLeagues.some(league => match.competition.name.includes(league));
      
      return isPopularTeam || isPopularLeague;
    })
    .slice(0, 4); // Show max 4 important matches

  // Recent live matches (limited to 3)
  const recentLiveMatches = liveMatches.slice(0, 3);

  // Remove favorite team
  const removeFavoriteTeam = (team: string) => {
    setFavoriteTeams(favoriteTeams.filter(t => t !== team));
  };

  // Remove favorite league
  const removeFavoriteLeague = (league: string) => {
    setFavoriteLeagues(favoriteLeagues.filter(l => l !== league));
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden mt-4">
      {/* Section Header */}
      <div className="border-b border-gray-700 px-4 py-3 flex justify-between items-center">
        <h2 className="font-semibold text-lg">Quick View</h2>
        <div className="flex bg-gray-700 rounded-md p-0.5">
          <button 
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              activeTab === 'upcoming' ? 'bg-teal-500 text-white' : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming
          </button>
          <button 
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              activeTab === 'live' ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('live')}
          >
            Live
          </button>
          <button 
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              activeTab === 'dashboard' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4 py-3">
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {/* Upcoming Matches Tab */}
            {activeTab === 'upcoming' && (
              <>
                {importantUpcomingMatches.length > 0 ? (
                  <div className="space-y-3">
                    {importantUpcomingMatches.map((match, index) => (
                      <div key={index} className="bg-gray-700 rounded-md p-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            {match.competition?.emblem && (
                              <div className="relative w-5 h-5 mr-2">
                                <Image 
                                  src={match.competition.emblem} 
                                  alt={match.competition.name || 'League'} 
                                  fill 
                                  className="object-contain" 
                                />
                              </div>
                            )}
                            <span className="text-xs text-gray-400">{match.competition?.name}</span>
                          </div>
                          <span className="text-xs font-mono bg-gray-800 px-2 py-1 rounded">
                            {new Date(match.utcDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                        
                        <div className="mt-2 flex justify-between items-center">
                          <div className="flex items-center">
                            {match.homeTeam?.crest && (
                              <div className="relative w-6 h-6 mr-2">
                                <Image 
                                  src={match.homeTeam.crest} 
                                  alt={match.homeTeam.name || 'Home team'} 
                                  fill 
                                  className="object-contain" 
                                />
                              </div>
                            )}
                            <span className="text-sm">{match.homeTeam?.shortName || match.homeTeam?.name}</span>
                          </div>
                          
                          <span className="text-xs font-medium px-2">vs</span>
                          
                          <div className="flex items-center">
                            <span className="text-sm">{match.awayTeam?.shortName || match.awayTeam?.name}</span>
                            {match.awayTeam?.crest && (
                              <div className="relative w-6 h-6 ml-2">
                                <Image 
                                  src={match.awayTeam.crest} 
                                  alt={match.awayTeam.name || 'Away team'} 
                                  fill 
                                  className="object-contain" 
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <Link 
                      href="/" 
                      className="block text-center text-teal-400 hover:text-teal-300 text-sm mt-3"
                    >
                      View all matches
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-400">No upcoming matches</p>
                    <Link 
                      href="/" 
                      className="block text-teal-400 hover:text-teal-300 text-sm mt-2"
                    >
                      View all matches
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Live Matches Tab */}
            {activeTab === 'live' && (
              <>
                {recentLiveMatches.length > 0 ? (
                  <div className="space-y-3">
                    {recentLiveMatches.map((match, index) => (
                      <div key={index} className="bg-gray-700 rounded-md p-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            {match.competition?.emblem && (
                              <div className="relative w-5 h-5 mr-2">
                                <Image 
                                  src={match.competition.emblem} 
                                  alt={match.competition.name || 'League'} 
                                  fill 
                                  className="object-contain" 
                                />
                              </div>
                            )}
                            <span className="text-xs text-gray-400">{match.competition?.name}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="mr-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full animate-pulse">
                              LIVE
                            </span>
                            <span className="text-xs font-mono">{match.minute || '0'}'</span>
                          </div>
                        </div>
                        
                        <div className="mt-2 flex justify-between items-center">
                          <div className="flex items-center flex-1">
                            {match.homeTeam?.crest && (
                              <div className="relative w-6 h-6 mr-2">
                                <Image 
                                  src={match.homeTeam.crest} 
                                  alt={match.homeTeam.name || 'Home team'} 
                                  fill 
                                  className="object-contain" 
                                />
                              </div>
                            )}
                            <span className="text-sm truncate">{match.homeTeam?.shortName || match.homeTeam?.name}</span>
                          </div>
                          
                          <div className="mx-2 px-3 py-1 bg-gray-800 rounded font-semibold">
                            {match.score?.fullTime.home !== null ? match.score?.fullTime.home : '0'}
                            {' - '}
                            {match.score?.fullTime.away !== null ? match.score?.fullTime.away : '0'}
                          </div>
                          
                          <div className="flex items-center flex-1 justify-end">
                            <span className="text-sm text-right truncate">{match.awayTeam?.shortName || match.awayTeam?.name}</span>
                            {match.awayTeam?.crest && (
                              <div className="relative w-6 h-6 ml-2">
                                <Image 
                                  src={match.awayTeam.crest} 
                                  alt={match.awayTeam.name || 'Away team'} 
                                  fill 
                                  className="object-contain" 
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <Link 
                      href="/?tab=live" 
                      className="block text-center text-red-400 hover:text-red-300 text-sm mt-3"
                    >
                      View all live matches
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-400">No live matches at the moment</p>
                    <Link 
                      href="/" 
                      className="block text-teal-400 hover:text-teal-300 text-sm mt-2"
                    >
                      View all matches
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Your Favorite Teams</h3>
                  {favoriteTeams.length > 0 ? (
                    <div className="space-y-2">
                      {favoriteTeams.map((team, index) => (
                        <div 
                          key={index} 
                          className="flex justify-between items-center bg-gray-700 rounded-md p-2"
                        >
                          <span className="text-sm">{team}</span>
                          <button 
                            onClick={() => removeFavoriteTeam(team)}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                            aria-label={`Remove ${team}`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No favorite teams added yet</p>
                  )}
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Your Favorite Leagues</h3>
                  {favoriteLeagues.length > 0 ? (
                    <div className="space-y-2">
                      {favoriteLeagues.map((league, index) => (
                        <div 
                          key={index} 
                          className="flex justify-between items-center bg-gray-700 rounded-md p-2"
                        >
                          <span className="text-sm">{league}</span>
                          <button 
                            onClick={() => removeFavoriteLeague(league)}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                            aria-label={`Remove ${league}`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No favorite leagues added yet</p>
                  )}
                </div>
                
                <button className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-md text-sm transition-colors">
                  Customize Dashboard
                </button>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Optional Footer */}
      <div className="border-t border-gray-700 px-4 py-2 text-xs text-gray-400 flex justify-between items-center">
        <span>Last updated: {new Date().toLocaleTimeString()}</span>
        <button className="hover:text-teal-400 transition-colors" aria-label="Refresh data">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default FeaturedContent; 