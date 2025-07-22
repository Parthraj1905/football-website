import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

// League data for display on landing page - same as league tables
const leagues = [
  {
    id: 'premier-league',
    name: 'Premier League',
    country: 'England',
    emblem: '/img/leagues/premier_league.webp',
    color: 'from-purple-600 to-purple-800'
  },
  {
    id: 'la-liga',
    name: 'La Liga',
    country: 'Spain',
    emblem: '/img/leagues/laliga.svg',
    color: 'from-blue-500 to-blue-700'
  },
  {
    id: 'bundesliga',
    name: 'Bundesliga',
    country: 'Germany',
    emblem: '/img/leagues/bundesliga.webp',
    color: 'from-red-600 to-red-800'
  },
  {
    id: 'serie-a',
    name: 'Serie A',
    country: 'Italy',
    emblem: '/img/leagues/serie_a.webp',
    color: 'from-blue-800 to-blue-950'
  },
  {
    id: 'ligue-1',
    name: 'Ligue 1',
    country: 'France',
    emblem: '/img/leagues/ligue_1.webp',
    color: 'from-green-600 to-green-800'
  },
  {
    id: 'championship',
    name: 'Championship',
    country: 'England',
    emblem: '/img/leagues/championship.webp',
    color: 'from-blue-500 to-sky-600'
  },
  {
    id: 'primeira-liga',
    name: 'Primeira Liga',
    country: 'Portugal',
    emblem: '/img/leagues/liga_portugal.webp',
    color: 'from-green-600 to-green-800'
  },
  {
    id: 'champions-league',
    name: 'Champions League',
    country: 'Europe',
    emblem: '/img/leagues/champions_league.webp',
    color: 'from-blue-600 to-blue-800'
  }
];

export default function LeagueStatsLanding() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Top Scorers</h1>
      <p className="text-gray-300 mb-8">
        View top goal scorers for major football leagues around the world.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {leagues.map(league => (
          <Link 
            key={league.id}
            href={`/league-stats/${league.id}/scorers`}
            className="block transition-transform hover:scale-[1.02]"
          >
            <div className={`bg-gradient-to-br ${league.color} rounded-lg p-6 h-full shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-white/70 uppercase tracking-wider">
                    {league.country}
                  </span>
                  <h2 className="text-xl font-bold text-white mt-1">{league.name}</h2>
                </div>
                <div className="relative w-12 h-12 bg-white/10 rounded-full p-2">
                  <Image
                    src={league.emblem}
                    alt={league.name}
                    fill
                    className="object-contain p-1"
                  />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="text-sm text-white">
                  View top scorers
                </div>
                <div className="text-white/70 text-xs mt-1">
                  Includes goals, assists and penalties
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 