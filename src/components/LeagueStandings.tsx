import React from 'react';
import Image from 'next/image';

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

interface LeagueStandingsProps {
  standings: TeamStanding[];
  leagueName: string;
  leagueEmblem: string;
  season: string;
  isLoading?: boolean;
}

// Placeholder loading component
const StandingsLoading = () => (
  <div className="animate-pulse">
    <div className="h-10 bg-gray-700 rounded mb-3"></div>
    {[...Array(20)].map((_, index) => (
      <div key={index} className="h-12 bg-gray-700 rounded mb-2"></div>
    ))}
  </div>
);

const LeagueStandings: React.FC<LeagueStandingsProps> = ({ 
  standings, 
  leagueName, 
  leagueEmblem, 
  season,
  isLoading = false 
}) => {
  if (isLoading) {
    return <StandingsLoading />;
  }

  // Validate standings data
  if (!standings || !Array.isArray(standings) || standings.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <h3 className="text-xl font-bold mb-2">No standings available</h3>
        <p className="text-gray-400">The standings for this league are not currently available.</p>
      </div>
    );
  }

  // Format form string (e.g. "WDLWW") into components with colors
  const renderForm = (form?: string) => {
    if (!form) return null;
    
    return (
      <div className="flex space-x-1">
        {form.split('').map((result, idx) => {
          let bgColor = 'bg-gray-600'; // Default
          
          if (result === 'W') bgColor = 'bg-green-600';
          else if (result === 'L') bgColor = 'bg-red-600';
          else if (result === 'D') bgColor = 'bg-yellow-600';
          
          return (
            <span 
              key={idx} 
              className={`${bgColor} w-5 h-5 flex items-center justify-center text-xs rounded-sm font-medium`}
            >
              {result}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-md">
      {/* Header */}
      <div className="bg-gray-900 p-4 border-b border-gray-700">
        <div className="flex items-center">
          {leagueEmblem && (
            <div className="relative w-10 h-10 mr-3">
              <Image
                src={leagueEmblem}
                alt={leagueName}
                fill
                className="object-contain"
              />
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold">{leagueName}</h2>
            <p className="text-sm text-gray-400">Standings • {season}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-gray-700">
              <th className="py-3 px-2 text-left w-8">#</th>
              <th className="py-3 px-2 text-left">Team</th>
              <th className="py-3 px-2 text-center w-10">MP</th>
              <th className="py-3 px-2 text-center w-10">W</th>
              <th className="py-3 px-2 text-center w-10">D</th>
              <th className="py-3 px-2 text-center w-10">L</th>
              <th className="py-3 px-2 text-center w-10">GF</th>
              <th className="py-3 px-2 text-center w-10">GA</th>
              <th className="py-3 px-2 text-center w-10">GD</th>
              <th className="py-3 px-2 text-center w-12">PTS</th>
              <th className="py-3 px-2 hidden md:table-cell">Form</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((standing, index) => {
              // Add a fallback position if missing
              const position = standing.position || index + 1;
              
              // Handle missing team data
              const team = standing.team || { id: index, name: 'Unknown Team', crest: '/img/placeholder-team.svg' };
              
              // Determine background color based on position (champions league, europa, relegation, etc.)
              let positionClass = '';
              if (position <= 4) {
                positionClass = 'border-l-4 border-blue-500'; // Champions League
              } else if (position === 5 || position === 6) {
                positionClass = 'border-l-4 border-orange-500'; // Europa League
              } else if (position >= standings.length - 2) {
                positionClass = 'border-l-4 border-red-500'; // Relegation
              }

              return (
                <tr 
                  key={team.id || index} 
                  className={`border-b border-gray-700 hover:bg-gray-700 transition-colors ${positionClass}`}
                >
                  <td className="py-3 px-2 text-center">{position}</td>
                  <td className="py-3 px-2">
                    <div className="flex items-center">
                      <div className="relative w-6 h-6 mr-2">
                        <Image
                          src={team.crest || '/img/placeholder-team.svg'}
                          alt={team.name || 'Team'}
                          fill
                          className="object-contain"
                          onError={(e) => {
                            // Fallback for broken image URLs
                            const target = e.target as HTMLImageElement;
                            target.src = '/img/placeholder-team.svg';
                          }}
                        />
                      </div>
                      <span className="hidden md:block">{team.name || 'Unknown Team'}</span>
                      <span className="md:hidden">{team.shortName || team.name || 'Unknown Team'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center">{standing.playedGames || 0}</td>
                  <td className="py-3 px-2 text-center">{standing.won || 0}</td>
                  <td className="py-3 px-2 text-center">{standing.draw || 0}</td>
                  <td className="py-3 px-2 text-center">{standing.lost || 0}</td>
                  <td className="py-3 px-2 text-center">{standing.goalsFor || 0}</td>
                  <td className="py-3 px-2 text-center">{standing.goalsAgainst || 0}</td>
                  <td className="py-3 px-2 text-center font-medium">
                    <span className={
                      (standing.goalDifference || 0) > 0 
                        ? 'text-green-500' 
                        : (standing.goalDifference || 0) < 0 
                          ? 'text-red-500' 
                          : ''
                    }>
                      {(standing.goalDifference || 0) > 0 ? '+' : ''}
                      {standing.goalDifference || 0}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center font-bold">{standing.points || 0}</td>
                  <td className="py-3 px-2 hidden md:table-cell">
                    {renderForm(standing.form)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="p-3 bg-gray-900 text-xs text-gray-400 grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="flex items-center">
          <span className="block w-3 h-3 bg-blue-500 mr-2"></span>
          UEFA Champions League
        </div>
        <div className="flex items-center">
          <span className="block w-3 h-3 bg-orange-500 mr-2"></span>
          UEFA Europa League
        </div>
        <div className="flex items-center">
          <span className="block w-3 h-3 bg-red-500 mr-2"></span>
          Relegation
        </div>
        <div className="flex items-center ml-auto">
          <span className="mr-1">W</span>Win
          <span className="mx-1">D</span>Draw
          <span className="mx-1">L</span>Loss
        </div>
      </div>
    </div>
  );
};

export default LeagueStandings; 