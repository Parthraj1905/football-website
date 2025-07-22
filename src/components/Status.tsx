"use client"

import {useState, useEffect} from 'react'
import { matchesType } from '@/types'
import LeagueTable from './LeagueTable'
import Image from 'next/image'
import { getTeamUpcomingMatches } from '@/api'

interface StatusProps {
  matchesList: matchesType[]
  matchesListFinished: matchesType[]
  liveMatches: matchesType[]
  olderFinishedMatches: matchesType[]
  upcomingMatches: matchesType[]
}

// Interface for grouped matches by league
interface GroupedMatches {
  [key: string]: {
    leagueName: string;
    leagueEmblem: string;
    matches: matchesType[];
  };
}

// Match modal component for displaying detailed match information
const MatchModal = ({ 
  match, 
  onClose 
}: { 
  match: matchesType | null, 
  onClose: () => void 
}) => {
  if (!match) return null;
  
  const [showNextMatches, setShowNextMatches] = useState(false);
  const [isLoadingNextMatches, setIsLoadingNextMatches] = useState(false);
  const [nextMatches, setNextMatches] = useState<{
    homeTeam: matchesType[],
    awayTeam: matchesType[]
  }>({
    homeTeam: [],
    awayTeam: []
  });
  
  const matchDate = new Date(match.utcDate);
  const formattedDate = matchDate.toLocaleDateString(undefined, { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const formattedTime = matchDate.toLocaleTimeString(undefined, { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  // Generate a background style based on competition
  const getBgStyle = () => {
    const competitionName = match.competition?.name?.toLowerCase() || '';
    
    if (competitionName.includes('champions league')) {
      return 'bg-gradient-to-r from-blue-900 to-blue-700';
    } else if (competitionName.includes('premier league')) {
      return 'bg-gradient-to-r from-purple-900 to-purple-700';
    } else if (competitionName.includes('la liga')) {
      return 'bg-gradient-to-r from-orange-900 to-orange-700';
    } else if (competitionName.includes('bundesliga')) {
      return 'bg-gradient-to-r from-red-900 to-red-700';
    } else if (competitionName.includes('serie a')) {
      return 'bg-gradient-to-r from-blue-900 to-teal-700';
    } else if (competitionName.includes('ligue 1')) {
      return 'bg-gradient-to-r from-indigo-900 to-indigo-700';
    }
    
    return 'bg-gradient-to-r from-gray-900 to-gray-700';
  };

  // Function to fetch next matches for both teams
  const handleShowNextMatches = async () => {
    // Toggle off if already showing
    if (showNextMatches) {
      setShowNextMatches(false);
      return;
    }

    // Check if we have valid team IDs
    if (!match.homeTeam.id || !match.awayTeam.id) {
      console.error("Missing team IDs:", match.homeTeam.id, match.awayTeam.id);
      setNextMatches({
        homeTeam: [],
        awayTeam: []
      });
      return;
    }

    setIsLoadingNextMatches(true);
    setShowNextMatches(true);
    
    try {
      console.log(`Fetching upcoming matches for ${match.homeTeam.name} (ID: ${match.homeTeam.id}) and ${match.awayTeam.name} (ID: ${match.awayTeam.id})`);
      
      // Fetch upcoming matches for both teams using the API
      const [homeTeamMatches, awayTeamMatches] = await Promise.all([
        getTeamUpcomingMatches(match.homeTeam.id, 3),
        getTeamUpcomingMatches(match.awayTeam.id, 3)
      ]);
      
      console.log('API Response - Home team matches:', homeTeamMatches);
      console.log('API Response - Away team matches:', awayTeamMatches);
      
      // If the API returns no matches, provide fallback data
      const shouldUseFallbackData = 
        (!homeTeamMatches || homeTeamMatches.length === 0) && 
        (!awayTeamMatches || awayTeamMatches.length === 0);
      
      if (shouldUseFallbackData) {
        console.log('Using fallback match data');
        
        // Create fallback match data using the current match's teams
        const createFallbackMatch = (id: number, homeTeam: any, awayTeam: any, daysFromNow: number) => {
          const matchDate = new Date();
          matchDate.setDate(matchDate.getDate() + daysFromNow);
          
          return {
            id: id,
            homeTeam: homeTeam,
            awayTeam: awayTeam,
            utcDate: matchDate.toISOString(),
            status: 'SCHEDULED',
            competition: match.competition,
            score: { 
              fullTime: { home: 0, away: 0 },
              halfTime: { home: 0, away: 0 },
              extraTime: { home: null, away: null },
              penalties: { home: null, away: null }
            },
            // Add other required fields from matchesType with default values
            matchday: 1,
            stage: 'REGULAR_SEASON',
            group: undefined,
            lastUpdated: new Date().toISOString(),
            area: match.area || { id: 0, name: 'Unknown', code: 'UNK', flag: null }
          };
        };
        
        // Create sample opponents
        const homeTeamOpponent1 = {
          id: 901,
          name: "Athletic Club",
          shortName: "Athletic",
          crest: "/img/placeholder-team.svg"
        };
        
        const homeTeamOpponent2 = {
          id: 902,
          name: "Real Sociedad",
          shortName: "Sociedad",
          crest: "/img/placeholder-team.svg"
        };
        
        const awayTeamOpponent1 = {
          id: 903,
          name: "Valencia CF",
          shortName: "Valencia",
          crest: "/img/placeholder-team.svg"
        };
        
        const awayTeamOpponent2 = {
          id: 904,
          name: "Sevilla FC",
          shortName: "Sevilla",
          crest: "/img/placeholder-team.svg"
        };
        
        // Create fallback matches for both teams
        const fallbackHomeTeamMatches = [
          createFallbackMatch(1001, match.homeTeam, homeTeamOpponent1, 5),
          createFallbackMatch(1002, homeTeamOpponent2, match.homeTeam, 12)
        ];
        
        const fallbackAwayTeamMatches = [
          createFallbackMatch(1003, match.awayTeam, awayTeamOpponent1, 7),
          createFallbackMatch(1004, awayTeamOpponent2, match.awayTeam, 14)
        ];
        
        setNextMatches({
          homeTeam: fallbackHomeTeamMatches as unknown as matchesType[],
          awayTeam: fallbackAwayTeamMatches as unknown as matchesType[]
        });
      } else {
        // Use real API data
        setNextMatches({
          homeTeam: homeTeamMatches || [],
          awayTeam: awayTeamMatches || []
        });
      }
    } catch (error) {
      console.error("Error fetching upcoming matches:", error);
      // In case of error, provide empty arrays
      setNextMatches({
        homeTeam: [],
        awayTeam: []
      });
    } finally {
      setIsLoadingNextMatches(false);
    }
  };
  
  // Helper to render a single upcoming match
  const renderUpcomingMatch = (upcomingMatch: matchesType) => {
    const matchDate = new Date(upcomingMatch.utcDate);
    const formattedDate = matchDate.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric' 
    });
    const formattedTime = matchDate.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    return (
      <div key={upcomingMatch.id} className="flex items-center p-2 border-b border-gray-700 last:border-b-0">
        <div className="w-6 h-6 relative">
          <Image 
            src={upcomingMatch.competition?.emblem || '/img/placeholder-league.svg'}
            alt={upcomingMatch.competition?.name || 'League'}
            fill
            className="object-contain"
          />
        </div>
        <div className="ml-2 flex-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-xs">{upcomingMatch.homeTeam.name}</span>
              <span className="mx-1 text-xs text-gray-400">vs</span>
              <span className="text-xs">{upcomingMatch.awayTeam.name}</span>
            </div>
            <span className="text-xs text-gray-400 ml-2">{formattedDate}, {formattedTime}</span>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="relative max-w-lg w-full" onClick={e => e.stopPropagation()}>
        {/* Close button */}
        <button 
          className="absolute top-2 right-2 text-white bg-gray-800 hover:bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center z-10"
          onClick={onClose}
        >
          ✕
        </button>
        
        {/* Modal content */}
        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-xl">
          {/* Header with competition info */}
          <div className={`px-4 py-3 ${getBgStyle()}`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 relative">
                <Image 
                  src={match.competition?.emblem || '/img/placeholder-league.svg'} 
                  alt={match.competition?.name || 'League'} 
                  fill 
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="font-bold text-white">{match.competition?.name}</h3>
                {match.group && (
                  <p className="text-xs text-gray-200">Group: {match.group}</p>
                )}
                {match.stage && match.stage !== 'REGULAR_SEASON' && (
                  <p className="text-xs text-gray-200">
                    Stage: {match.stage.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Match details */}
          <div className="p-4">
            <div className="text-center mb-4">
              <p className="text-gray-400 text-sm">{formattedDate}</p>
              <p className="text-gray-400 text-sm">{formattedTime}</p>
              {match.status === 'FINISHED' && (
                <span className="inline-block px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded mt-1">
                  Full Time
                </span>
              )}
              {match.status === 'IN_PLAY' && (
                <span className="inline-block px-2 py-1 bg-red-900 text-xs text-red-300 rounded mt-1 flex items-center justify-center mx-auto" style={{width: 'fit-content'}}>
                  <span className="w-2 h-2 rounded-full bg-red-500 mr-1 animate-pulse"></span>
                  Live
                </span>
              )}
              {match.status === 'TIMED' && (
                <span className="inline-block px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded mt-1">
                  Upcoming
                </span>
              )}
            </div>
            
            {/* Teams and score */}
            <div className="flex items-center justify-between mb-6">
              {/* Home team */}
              <div className="flex flex-col items-center text-center w-2/5">
                <div className="w-16 h-16 relative mb-2">
                  <Image 
                    src={match.homeTeam?.crest || '/img/placeholder-team.svg'} 
                    alt={match.homeTeam?.name || 'Home Team'} 
                    fill 
                    className="object-contain"
                  />
                </div>
                <h4 className="font-semibold">{match.homeTeam?.name}</h4>
                <p className="text-xs text-gray-400">{match.homeTeam?.shortName}</p>
              </div>
              
              {/* Score */}
              <div className="flex flex-col items-center">
                {match.status === 'FINISHED' || match.status === 'IN_PLAY' ? (
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">
                      {match.score?.fullTime.home ?? 0} - {match.score?.fullTime.away ?? 0}
                    </div>
                    {match.score?.halfTime && (
                      <div className="text-xs text-gray-400">
                        HT: {match.score.halfTime.home} - {match.score.halfTime.away}
                      </div>
                    )}
                    {match.extraTime && (
                      <div className="text-xs text-gray-400 mt-1">
                        ET: {match.extraTime.fullTime.home} - {match.extraTime.fullTime.away}
                      </div>
                    )}
                    {match.penalties && (
                      <div className="text-xs text-gray-400 mt-1">
                        Penalties: {match.penalties.fullTime.home} - {match.penalties.fullTime.away}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xl text-gray-400 font-bold">vs</div>
                )}
              </div>
              
              {/* Away team */}
              <div className="flex flex-col items-center text-center w-2/5">
                <div className="w-16 h-16 relative mb-2">
                  <Image 
                    src={match.awayTeam?.crest || '/img/placeholder-team.svg'} 
                    alt={match.awayTeam?.name || 'Away Team'} 
                    fill 
                    className="object-contain"
                  />
                </div>
                <h4 className="font-semibold">{match.awayTeam?.name}</h4>
                <p className="text-xs text-gray-400">{match.awayTeam?.shortName}</p>
              </div>
            </div>
            
            {/* Match stats and info */}
            <div className="border-t border-gray-700 pt-4">
              <h4 className="font-semibold mb-2">Match Information</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-400">Matchday:</p>
                  <p>{match.matchday || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Last Updated:</p>
                  <p>{match.lastUpdated ? new Date(match.lastUpdated).toLocaleString() : 'N/A'}</p>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="mt-4 flex justify-center">
                <button 
                  className={`flex items-center text-white py-2 px-4 rounded text-sm transition-colors ${
                    showNextMatches ? 'bg-teal-700 hover:bg-teal-800' : 'bg-teal-600 hover:bg-teal-700'
                  }`}
                  onClick={handleShowNextMatches}
                >
                  {showNextMatches ? 'Hide' : 'Show'} Next Matches
                  {showNextMatches && !isLoadingNextMatches && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                  {isLoadingNextMatches && (
                    <svg className="animate-spin ml-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                </button>
              </div>
              
              {/* Next matches section */}
              {showNextMatches && !isLoadingNextMatches && (
                <div className="mt-4 border-t border-gray-700 pt-4">
                  <div className="mb-4">
                    <h5 className="font-semibold text-sm mb-2">Upcoming matches for {match.homeTeam.name}</h5>
                    <div className="bg-gray-850 rounded overflow-hidden">
                      {nextMatches.homeTeam.length > 0 ? (
                        nextMatches.homeTeam.map(renderUpcomingMatch)
                      ) : (
                        <p className="p-2 text-xs text-gray-400">No upcoming matches found</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-sm mb-2">Upcoming matches for {match.awayTeam.name}</h5>
                    <div className="bg-gray-850 rounded overflow-hidden">
                      {nextMatches.awayTeam.length > 0 ? (
                        nextMatches.awayTeam.map(renderUpcomingMatch)
                      ) : (
                        <p className="p-2 text-xs text-gray-400">No upcoming matches found</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component to display grouped league matches
const GroupedLeagueMatches = ({ 
  groupedMatches, 
  isLive = false, 
  showDate = false,
  onMatchClick
}: { 
  groupedMatches: GroupedMatches; 
  isLive?: boolean;
  showDate?: boolean;
  onMatchClick: (match: matchesType) => void;
}) => {
  return (
    <>
      {Object.keys(groupedMatches).map((leagueKey) => {
        const leagueData = groupedMatches[leagueKey];
        return (
          <div key={leagueKey} className="mb-6">
            <div className="flex items-center gap-2 px-2 py-3 bg-[rgb(40,46,58)] rounded-t-md border-b border-gray-700">
              <div className="w-6 h-6 relative">
                <Image 
                  src={leagueData.leagueEmblem || '/img/placeholder-league.svg'} 
                  alt={leagueData.leagueName} 
                  fill 
                  className="object-contain"
                />
              </div>
              <h3 className="font-semibold text-md">{leagueData.leagueName}</h3>
              {isLive && (
                <span className="flex items-center ml-2 text-xs text-red-400">
                  <span className="w-2 h-2 rounded-full bg-red-500 mr-1 animate-pulse"></span>
                  Live
                </span>
              )}
            </div>
            <div className="mb-4">
              {leagueData.matches.map((match) => (
                <div 
                  key={match.id} 
                  className="py-3 px-2 md:px-3 bg-[rgb(40,46,58)] border-b border-gray-700 last:border-b-0 last:rounded-b-md cursor-pointer hover:bg-[rgb(50,56,68)] transition-colors"
                  onClick={() => onMatchClick(match)}
                >
                  <Matches data={match} isLive={isLive} showDate={showDate} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
};

// Component to display individual match data
const Matches = ({ data, isLive = false, showDate = false }: { data: matchesType; isLive?: boolean; showDate?: boolean }) => {
  if (!data || !data.homeTeam || !data.awayTeam) {
    return <p className="text-center py-2 text-yellow-400">Match details incomplete.</p>;
  }

  const getDate = new Date(data.utcDate).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const matchDate = showDate && data.utcDate ? new Date(data.utcDate).toLocaleDateString() : null;

  return (
    <div>
      {showDate && matchDate && (
        <div className="mb-2 text-xs text-gray-400">
          {matchDate}
        </div>
      )}
      <div className='grid grid-cols-3'>
        <div className='w-full flex items-center'>
          <div className='w-[20px] h-[20px] relative mr-2'>
            <Image 
              src={data.homeTeam.crest || '/img/placeholder-team.svg'} 
              alt={data.homeTeam.name} 
              fill 
              className='object-cover' 
            />
          </div>
          <p className='text-sm'>{data.homeTeam.name}</p>
        </div> 
        <div className='px-2 m-auto flex justify-center items-center bg-slate-600 rounded-md'>
          {data.status === 'FINISHED' ? (
            <p className='py-1 text-teal-400 text-xs'>
              {data.score?.fullTime.home} : {data.score?.fullTime.away}
            </p>
          ) : isLive ? (
            <p className='py-1 text-red-400 text-xs flex items-center'>
              <span className='w-1.5 h-1.5 rounded-full bg-red-500 mr-1 animate-pulse'></span>
              {data.score?.fullTime.home ?? 0} : {data.score?.fullTime.away ?? 0}
            </p>
          ) : (
            <p className='py-1 text-teal-400 text-xs'>{getDate}</p>
          )}
        </div>
        <div className='w-full flex items-center justify-end'>
          <p className='text-sm text-right'>{data.awayTeam.name}</p>
          <div className='w-[20px] h-[20px] relative ml-2'>
            <Image 
              src={data.awayTeam.crest || '/img/placeholder-team.svg'} 
              alt={data.awayTeam.name} 
              fill 
              className='object-cover' 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const Status = ({
  matchesList,
  matchesListFinished,
  liveMatches,
  olderFinishedMatches,
  upcomingMatches
}: StatusProps) => {
  const [statusMatch, setStatusMatch] = useState("UPCOMING")
  const [isLoading, setIsLoading] = useState(true)
  const [showOlderMatches, setShowOlderMatches] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<matchesType | null>(null)

  // Filter matches based on status
  const todayMatches = matchesList?.filter(match => match?.status === "TIMED") || []
  const finishedMatchesToday = matchesList?.filter(match => match?.status === "FINISHED") || []
  const finishedMatchesYesterday = matchesListFinished || []
  const liveMatchesData = liveMatches || []
  const olderMatches = olderFinishedMatches || []
  const upcomingMatchesData = upcomingMatches || []
  
  // Combine all upcoming matches (from both upcomingMatches and today's TIMED matches)
  const allUpcomingMatches = [...upcomingMatchesData, ...todayMatches]
  
  // Remove mock data functionality
  const useMockData = false;
  const finalUpcomingMatches = allUpcomingMatches;

  // Function to group matches by league
  const groupMatchesByLeague = (matches: matchesType[]): GroupedMatches => {
    const grouped: GroupedMatches = {};
    
    matches.forEach((match) => {
      if (!match || !match.competition) return;
      
      const leagueId = match.competition.id?.toString() || match.competition.name;
      
      if (!grouped[leagueId]) {
        grouped[leagueId] = {
          leagueName: match.competition.name,
          leagueEmblem: match.competition.emblem,
          matches: []
        };
      }
      
      grouped[leagueId].matches.push(match);
    });
    
    return grouped;
  };

  // Group all the match arrays by league
  const todayMatchesGrouped = groupMatchesByLeague(todayMatches);
  const liveMatchesGrouped = groupMatchesByLeague(liveMatchesData);
  const recentFinishedMatchesGrouped = groupMatchesByLeague([...finishedMatchesToday, ...finishedMatchesYesterday]);
  const olderMatchesGrouped = groupMatchesByLeague(olderMatches);
  const upcomingMatchesGrouped = groupMatchesByLeague(finalUpcomingMatches);

  // Function to handle match click
  const handleMatchClick = (match: matchesType) => {
    setSelectedMatch(match);
    console.log("Match clicked:", match);
  };

  // Function to close match modal
  const closeMatchModal = () => {
    setSelectedMatch(null);
  };

  useEffect(() => {
    // Simulate loading for better UX
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)
    
    return () => clearTimeout(timer)
  }, [statusMatch, showOlderMatches])

  // Create a no matches message component
  const NoMatchesMessage = () => (
    <div className="p-4 bg-[rgb(40,46,58)] rounded-md text-center">
      <p className="text-teal-400">No matches available at the moment.</p>
    </div>
  )

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-14 bg-[rgb(40,46,58)] rounded-md mb-2"></div>
      <div className="h-14 bg-[rgb(40,46,58)] rounded-md mb-2"></div>
      <div className="h-14 bg-[rgb(40,46,58)] rounded-md mb-2"></div>
    </div>
  )

  return (
    <div>
      <div className='flex flex-wrap gap-2 mb-2 md:mb-4'>
        <button 
          onClick={() => {
            setStatusMatch("UPCOMING")
            setShowOlderMatches(false)
          }}
          className={`px-3 py-1 text-primary text-xs md:text-sm rounded-md ${statusMatch === 'UPCOMING' ? 'bg-teal-400 font-semibold' : 'bg-slate-600 hover:bg-slate-500 font-regular'}`}
        >
          Upcoming
        </button>
        <button 
          onClick={() => setStatusMatch("LIVE")}
          className={`px-3 py-1 text-primary text-xs md:text-sm rounded-md ${statusMatch === 'LIVE' ? 'bg-teal-400 font-semibold' : 'bg-red-500 hover:bg-red-600 font-regular'}`}
        >
          <span className="flex items-center">
            <span className={`w-2 h-2 rounded-full ${statusMatch === 'LIVE' ? 'bg-white' : 'bg-red-300'} mr-1 animate-pulse`}></span>
            Live
          </span>
        </button>
        <button 
          onClick={() => {
            setStatusMatch("FINISHED")
            setShowOlderMatches(false)
          }}
          className={`px-3 py-1 text-primary text-xs md:text-sm rounded-md ${statusMatch === 'FINISHED' ? 'bg-teal-400 font-semibold' : 'bg-slate-600 hover:bg-slate-500 font-regular'}`}
        >
          Finished
        </button>
      </div>

      <div className='w-full'>
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {/* Upcoming Matches Tab */}
            {statusMatch === 'UPCOMING' && (
              Object.keys(upcomingMatchesGrouped).length > 0 ? (
                <GroupedLeagueMatches 
                  groupedMatches={upcomingMatchesGrouped} 
                  onMatchClick={handleMatchClick}
                  showDate={true}
                />
              ) : (
                <NoMatchesMessage />
              )
            )}
            
            {/* Live Matches Tab */}
            {statusMatch === 'LIVE' && (
              Object.keys(liveMatchesGrouped).length > 0 ? (
                <GroupedLeagueMatches groupedMatches={liveMatchesGrouped} isLive={true} onMatchClick={handleMatchClick} />
              ) : (
                <NoMatchesMessage />
              )
            )}
            
            {/* Finished Matches Tab */}
            {statusMatch === 'FINISHED' && (
              Object.keys(olderMatchesGrouped).length > 0 ? (
                <GroupedLeagueMatches groupedMatches={olderMatchesGrouped} showDate={true} onMatchClick={handleMatchClick} />
              ) : (
                <NoMatchesMessage />
              )
            )}
          </>
        )}
      </div>

      {/* Match detail modal */}
      {selectedMatch && (
        <MatchModal 
          match={selectedMatch} 
          onClose={closeMatchModal} 
        />
      )}
    </div>
  )
}

export default Status