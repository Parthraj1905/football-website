import React from 'react';
import { matchesType } from '@/types';
import LeagueTable from '@/components/LeagueTable';

/**
 * Helper function to render league matches consistently across all league pages
 * @param leagueData - Data returned from filterLeague function
 * @param leagueName - Name of the league for error messages
 */
export function renderLeagueMatches(
  leagueData: matchesType[] | { matches: never[]; error: any },
  leagueName: string
) {
  // Handle error case
  if (!Array.isArray(leagueData)) {
    return (
      <div className='w-[600px] p-4 bg-gray-800 rounded-lg'>
        <h2 className="text-xl font-bold text-red-500 mb-2">Error loading matches</h2>
        <p className="text-gray-300">{leagueData.error || `Failed to load ${leagueName} data`}</p>
      </div>
    );
  }

  // Handle empty data case
  if (leagueData.length === 0) {
    return (
      <div className='w-[600px] p-4 bg-gray-800 rounded-lg'>
        <h2 className="text-xl font-bold mb-2">No matches found</h2>
        <p className="text-gray-300">There are currently no {leagueName} matches available.</p>
      </div>
    );
  }

  // Render matches
  return (
    <div className='w-[600px]'>
      {leagueData.map((data) => (
        <div key={data.id}>
          <LeagueTable data={data} />
        </div>
      ))}
    </div>
  );
} 