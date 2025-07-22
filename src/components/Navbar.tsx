"use client"

import { FC, useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import ThemeToggle from './ThemeToggle'

// Common teams and leagues for search suggestions
const searchSuggestions = {
  teams: [
    "Manchester United", "Liverpool", "Chelsea", "Arsenal", 
    "Barcelona", "Real Madrid", "Bayern Munich", "PSG"
  ],
  leagues: [
    "Premier League", "La Liga", "Serie A", "Bundesliga", 
    "Ligue 1", "Champions League", "Europa League"
  ]
};

// League mapping for stats dropdown
const popularLeagues = [
  { slug: 'premier-league', name: 'Premier League', emblem: '/img/leagues/premier_league.webp' },
  { slug: 'la-liga', name: 'La Liga', emblem: '/img/leagues/laliga.svg' },
  { slug: 'bundesliga', name: 'Bundesliga', emblem: '/img/leagues/bundesliga.webp' },
  { slug: 'serie-a', name: 'Serie A', emblem: '/img/leagues/serie_a.webp' },
  { slug: 'ligue-1', name: 'Ligue 1', emblem: '/img/leagues/ligue_1.webp' }
];

const Navbar: FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [showStatsDropdown, setShowStatsDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const statsDropdownRef = useRef<HTMLDivElement>(null)

  // Filter suggestions based on search query
  const filteredSuggestions = {
    teams: searchQuery.length > 1 
      ? searchSuggestions.teams.filter(team => 
          team.toLowerCase().includes(searchQuery.toLowerCase()))
      : [],
    leagues: searchQuery.length > 1 
      ? searchSuggestions.leagues.filter(league => 
          league.toLowerCase().includes(searchQuery.toLowerCase()))
      : []
  };

  const hasSearchResults = filteredSuggestions.teams.length > 0 || filteredSuggestions.leagues.length > 0;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
      if (statsDropdownRef.current && !statsDropdownRef.current.contains(event.target as Node)) {
        setShowStatsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className='flex flex-col'>
      <div className='flex justify-between items-center py-2'>
        <Link href="/" className='flex items-center space-x-2'>
          <div className='relative w-[30px] h-[30px]'>
            <Image src="/football-info.png" alt="icon" fill className='object-cover' />
          </div>
          <span className='text-2xl font-bold hidden md:block'>Fotmob</span>
        </Link>
        
        <div className="flex items-center space-x-3">
          {/* News button positioned in the main navigation */}
          <Link 
            href="/news" 
            className="hidden md:flex items-center px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <span className="text-sm">News</span>
          </Link>
          
          {/* Stats Dropdown */}
          <div className="relative hidden md:block" ref={statsDropdownRef}>
            <button 
              className="flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              onClick={() => setShowStatsDropdown(!showStatsDropdown)}
              aria-label="Stats"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-sm">Stats</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            
            {/* Stats dropdown menu */}
            {showStatsDropdown && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-gray-800 rounded-md shadow-lg z-30 overflow-hidden">
                <div className="px-4 py-2 bg-gray-900 border-b border-gray-700">
                  <h3 className="font-medium">Stats & Tables</h3>
                </div>
                
                <div className="p-2">
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <Link 
                      href="/league-tables"
                      className="flex items-center justify-center py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                      onClick={() => setShowStatsDropdown(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm">Tables</span>
                    </Link>
                    
                    <Link 
                      href="/league-stats"
                      className="flex items-center justify-center py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                      onClick={() => setShowStatsDropdown(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm">Top Scorers</span>
                    </Link>
                  </div>
                  
                  <div className="py-2 px-3 text-xs text-gray-400 border-b border-gray-700">
                    Popular Leagues
                  </div>
                  
                  {popularLeagues.map(league => (
                    <div key={league.slug} className="border-b border-gray-700 last:border-0">
                      <div className="px-2 py-2">
                        <div className="flex items-center mb-1">
                          <div className="relative w-4 h-4 mr-2">
                            <Image
                              src={league.emblem}
                              alt={league.name}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <span className="text-sm font-medium">{league.name}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-1 mt-1">
                          <Link
                            href={`/league-tables/${league.slug}`}
                            className="text-xs py-1 px-2 bg-gray-700 hover:bg-gray-600 rounded text-center transition-colors"
                            onClick={() => setShowStatsDropdown(false)}
                          >
                            Table
                          </Link>
                          <Link
                            href={`/league-stats/${league.slug}/scorers`}
                            className="text-xs py-1 px-2 bg-gray-700 hover:bg-gray-600 rounded text-center transition-colors"
                            onClick={() => setShowStatsDropdown(false)}
                          >
                            Top Scorers
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Enhanced Search */}
          <div className="relative" ref={searchRef}>
            <div className="flex items-center bg-gray-700 rounded-md px-3 py-1.5">
              <input
                type="text"
                placeholder="Search leagues..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.length > 1) {
                    setShowSearchResults(true);
                  } else {
                    setShowSearchResults(false);
                  }
                }}
                onFocus={() => {
                  if (searchQuery.length > 1) {
                    setShowSearchResults(true);
                  }
                }}
                className="bg-transparent text-sm focus:outline-none w-40 lg:w-48"
              />
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 text-gray-400 ml-1"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            {/* Search results dropdown */}
            {showSearchResults && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-gray-800 rounded-md shadow-lg z-30 overflow-hidden">
                {hasSearchResults ? (
                  <div>
                    {filteredSuggestions.leagues.length > 0 && (
                      <div>
                        <div className="px-3 py-1 text-xs text-gray-400 border-b border-gray-700">Leagues</div>
                        <div className="max-h-48 overflow-y-auto">
                          {filteredSuggestions.leagues.map((league, index) => {
                            const leagueSlug = league.toLowerCase().replace(/\s+/g, '-');
                            return (
                              <Link 
                                key={`league-${index}`} 
                                href={`/league-tables/${leagueSlug}`}
                                className="block px-4 py-2 text-sm hover:bg-gray-700 transition-colors"
                                onClick={() => setShowSearchResults(false)}
                              >
                                {league}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-400">No leagues found</div>
                )}
              </div>
            )}
          </div>
          
          <ThemeToggle />
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1 rounded-md bg-slate-600 hover:bg-slate-500 transition-colors md:hidden"
            aria-label="Toggle mobile menu"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 text-white" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-2 py-2 px-3 rounded-md bg-gray-800">
          <div className="flex border-b border-gray-700 pb-2 mb-2">
            <input
              type="text"
              placeholder="Search leagues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-700 rounded-md py-1 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-teal-400 w-full"
            />
          </div>
          <div className="mb-2 py-2 border-b border-gray-700">
            <Link
              href="/news"
              className="block py-2 text-sm"
              onClick={() => setIsMenuOpen(false)}
            >
              News
            </Link>
            <div className="py-2">
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Stats & Tables</span>
              </div>
              <div className="pl-4 border-l border-gray-700">
                <Link
                  href="/league-tables"
                  className="block py-1 text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  League Tables
                </Link>
                <Link
                  href="/league-stats"
                  className="block py-1 text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Top Scorers
                </Link>
              </div>
            </div>
          </div>
          
          <div className="py-2">
            <h3 className="text-sm font-semibold text-gray-400 mb-1">Settings</h3>
            <button 
              className="w-full text-left py-2 text-sm flex items-center justify-between"
              onClick={() => {
                setIsMenuOpen(false);
                // Code to trigger profile/account dialog
              }}
            >
              <span>Account</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Navbar