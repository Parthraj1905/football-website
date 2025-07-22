import { apiOptions, matchesType } from "@/types"

const options:apiOptions =  {
  next: { revalidate: 30 },
  headers: {
    "X-Auth-Token": process.env.API_TOKEN,
    "Content-Type": "application/json",
  },
}

// Helper function to handle API errors
const handleApiResponse = async (response: Response, apiName: string) => {
  if (!response.ok) {
    const remainingRequests = response.headers.get('X-Requests-Available-Minute');
    if (remainingRequests && parseInt(remainingRequests) === 0) {
      console.error(`API rate limit reached for ${apiName}. Please try again later.`);
      return { error: 'Rate limit reached. Please try again in a minute.', isRateLimited: true };
    }
    
    console.error(`${apiName} API error: ${response.status} ${response.statusText}`);
    if (response.status === 403) {
      return { error: 'API authorization failed. Please check your API token.', isAuthError: true };
    }
    
    return { error: `Failed to fetch data from ${apiName} API. Status: ${response.status}` };
  }
  
  try {
    return await response.json();
  } catch (error) {
    console.error(`Error parsing ${apiName} API response:`, error);
    return { error: `Failed to parse ${apiName} API response` };
  }
};

export const getMatchesfootball = async () => {
  try {
    const matchData = await fetch('https://api.football-data.org/v4/matches', options);
    const result = await handleApiResponse(matchData, 'Matches');
    
    if (result.error) {
      console.error(result.error);
      return { matches: [], error: result.error, isRateLimited: result.isRateLimited };
    }
    
    return result;
  } catch (error) {
    console.error("Error fetching matches:", error);
    return { matches: [], error: "Failed to connect to matches API" };
  }
}

const todayDate = new Date()
const getDateMonth = new Date(todayDate.getTime());
getDateMonth.setDate(todayDate.getDate() - 1);
const year = getDateMonth.getFullYear()
const month = String(getDateMonth.getMonth() + 1).padStart(2, '0');
const day = String(getDateMonth.getDate()).padStart(2, '0');

const yesterday = [year, month, day].join('-');
  
export const getMatchesfootballFinished = async () => {
  try {
    const matchData = await fetch(`https://api.football-data.org/v4/matches?date=${yesterday}`, options);
    const result = await handleApiResponse(matchData, 'Finished Matches');
    
    if (result.error) {
      console.error(result.error);
      return { matches: [], error: result.error, isRateLimited: result.isRateLimited };
    }
    
    return result;
  } catch (error) {
    console.error("Error fetching finished matches:", error);
    return { matches: [], error: "Failed to connect to finished matches API" };
  }
}

// Function to get matches from the past two weeks
export const getMatchesOlderFinished = async () => {
  try {
    // Generate dates for past two weeks (excluding yesterday)
    const dates = [];
    for (let i = 2; i <= 14; i++) {
      const pastDate = new Date(todayDate.getTime());
      pastDate.setDate(todayDate.getDate() - i);
      const pastYear = pastDate.getFullYear();
      const pastMonth = String(pastDate.getMonth() + 1).padStart(2, '0');
      const pastDay = String(pastDate.getDate()).padStart(2, '0');
      dates.push([pastYear, pastMonth, pastDay].join('-'));
    }

    // Fetch matches for the last 3 days only (to avoid too many API calls)
    // The football API has limitations on the number of requests
    const limitedDates = dates.slice(0, 3);
    
    const allMatches = [];
    let errorMsg = null;
    let isRateLimited = false;
    
    for (const date of limitedDates) {
      try {
        const matchData = await fetch(`https://api.football-data.org/v4/matches?date=${date}`, options);
        const result = await handleApiResponse(matchData, `Older Matches (${date})`);
        
        if (result.error) {
          errorMsg = result.error;
          isRateLimited = result.isRateLimited || false;
          break; // Stop fetching more dates if we hit an error
        }
        
        if (result.matches && Array.isArray(result.matches)) {
          allMatches.push(...result.matches);
        }
      } catch (err) {
        console.error(`Error fetching matches for date ${date}:`, err);
      }
    }
    
    if (errorMsg && allMatches.length === 0) {
      return { matches: [], error: errorMsg, isRateLimited };
    }
    
    return { matches: allMatches };
  } catch (error) {
    console.error("Error fetching older finished matches:", error);
    return { matches: [], error: "Failed to connect to older matches API" };
  }
}

// Function to get live matches
export const getLiveMatches = async () => {
  try {
    // Using the matches endpoint with status=LIVE,IN_PLAY,PAUSED parameters
    const matchData = await fetch('https://api.football-data.org/v4/matches?status=LIVE,IN_PLAY,PAUSED', options);
    const result = await handleApiResponse(matchData, 'Live Matches');
    
    if (result.error) {
      console.error(result.error);
      return { matches: [], error: result.error, isRateLimited: result.isRateLimited };
    }
    
    return result;
  } catch (error) {
    console.error("Error fetching live matches:", error);
    return { matches: [], error: "Failed to connect to live matches API" };
  }
}

// Function to get upcoming matches for the next 7 days
export const getUpcomingMatches = async () => {
  // Maximum number of retries
  const MAX_RETRIES = 2;
  // Initial delay in milliseconds (will be doubled each retry)
  let delay = 1000;
  let retries = 0;
  
  try {
    // Get today's date and date 7 days from now
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    // Format dates as YYYY-MM-DD
    const todayFormatted = today.toISOString().split('T')[0];
    const nextWeekFormatted = nextWeek.toISOString().split('T')[0];
    
    console.log(`Fetching upcoming matches from ${todayFormatted} to ${nextWeekFormatted}`);
    
    // Retry logic with exponential backoff
    while (retries <= MAX_RETRIES) {
      try {
        // Only get SCHEDULED/TIMED matches (not IN_PLAY, PAUSED, FINISHED, etc.)
        const matchData = await fetch(`https://api.football-data.org/v4/matches?dateFrom=${todayFormatted}&dateTo=${nextWeekFormatted}&status=SCHEDULED,TIMED`, options);
        const result = await handleApiResponse(matchData, 'Upcoming Matches');
        
        if (result.error) {
          if (result.isRateLimited && retries < MAX_RETRIES) {
            // Rate limited, retry after delay
            console.log(`Rate limited: waiting ${delay}ms before retry ${retries + 1}/${MAX_RETRIES}`);
            await new Promise(r => setTimeout(r, delay));
            delay *= 2; // Exponential backoff
            retries++;
            continue;
          }
          
          // If we're rate limited and out of retries, return a fallback empty result
          console.error(result.error);
          
          if (result.isRateLimited) {
            console.log("Rate limit reached, returning empty response");
            return { 
              matches: [], 
              error: "Rate limit reached. Try again later.",
              isRateLimited: true 
            };
          }
          
          return { matches: [], error: result.error, isRateLimited: result.isRateLimited };
        }
        
        // Success - return the result
        return result;
      } catch (apiError) {
        console.error(`API error attempt ${retries + 1}/${MAX_RETRIES}:`, apiError);
        
        if (retries < MAX_RETRIES) {
          await new Promise(r => setTimeout(r, delay));
          delay *= 2;
          retries++;
        } else {
          throw apiError; // Re-throw if we're out of retries
        }
      }
    }
    
    // This should not be reached due to throw inside the loop,
    // but TypeScript needs a return value
    return { matches: [], error: "Maximum retries exceeded" };
  } catch (error) {
    console.error("Error fetching upcoming matches:", error);
    return { matches: [], error: "Failed to connect to upcoming matches API" };
  }
}

export const getNewsInfo = async () => {
  try {
    const newsData = await fetch(`https://newsapi.org/v2/everything?apiKey=${process.env.API_TOKEN_NEWS}&q=soccer&pageSize=5`, {next:{revalidate:20}});
    
    if (!newsData.ok) {
      console.error(`News API error: ${newsData.status} ${newsData.statusText}`);
      return { articles: [], error: `Failed to fetch news. Status: ${newsData.status}` };
    }
    
    return newsData.json();
  } catch (error) {
    console.error("Error fetching news:", error);
    return { articles: [], error: "Failed to connect to news API" };
  }
}

export const filterLeague = async (filterData:string) => {
  try {
    const getEnglishLeague = await getMatchesfootball();
    
    if (getEnglishLeague.error) {
      return { matches: [], error: getEnglishLeague.error };
    }
    
    const filterPremierLeague:matchesType[] = getEnglishLeague?.matches || [];
    const getData = filterPremierLeague.filter((item) => item.competition.name === filterData);
    return getData;
  } catch (error) {
    console.error(`Error filtering league ${filterData}:`, error);
    return [];
  }
}

// Get today matches filtered by date
export async function getTodayMatches() {
  const today = new Date().toISOString().split('T')[0];
  try {
    const response = await fetch(`https://api.football-data.org/v4/matches?dateFrom=${today}&dateTo=${today}`, options);
    const result = await handleApiResponse(response, 'Today Matches');
    
    if (result.error) {
      console.error(result.error);
      return { matches: [], error: result.error };
    }
    
    return result.matches;
  } catch(e) {
    console.error('Error fetching today matches:', e);
    return { matches: [], error: "Failed to connect to today's matches API" };
  }
}

// Function to get league standings (table with positions, points, etc.)
export async function getLeagueStandings(leagueCode: string) {
  try {
    // Map of commonly used leagues to their API codes
    const leagueCodes: {[key: string]: string} = {
      'Premier League': 'PL',
      'Primera Division': 'PD',
      'La Liga': 'PD',
      'Bundesliga': 'BL1',
      'Serie A': 'SA',
      'Ligue 1': 'FL1',
      'Championship': 'ELC',
      'Primeira Liga': 'PPL',
      'Eredivisie': 'DED',
      'Champions League': 'CL',
    };

    // If full name is provided, convert to code
    const code = leagueCodes[leagueCode] || leagueCode;
    
    console.log(`Fetching standings for league: ${leagueCode} (API code: ${code})`);
    
    const response = await fetch(`https://api.football-data.org/v4/competitions/${code}/standings`, options);
    const result = await handleApiResponse(response, `League Standings (${code})`);
    
    if (result.error) {
      console.error(result.error);
      return null;
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching league standings:', error);
    return null;
  }
}

// Function to get top scorers for a league
export async function getLeagueTopScorers(leagueCode: string) {
  try {
    // Map of commonly used leagues to their API codes
    const leagueCodes: {[key: string]: string} = {
      'Premier League': 'PL',
      'Primera Division': 'PD',
      'La Liga': 'PD',
      'Bundesliga': 'BL1',
      'Serie A': 'SA',
      'Ligue 1': 'FL1',
      'Championship': 'ELC',
      'Primeira Liga': 'PPL',
      'Eredivisie': 'DED',
      'Champions League': 'CL',
    };

    // If full name is provided, convert to code
    const code = leagueCodes[leagueCode] || leagueCode;
    
    console.log(`Fetching top scorers for league: ${leagueCode} (API code: ${code})`);
    
    const response = await fetch(`https://api.football-data.org/v4/competitions/${code}/scorers`, options);
    const result = await handleApiResponse(response, `Top Scorers (${code})`);
    
    if (result.error) {
      console.error(result.error);
      return null;
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching top scorers:', error);
    return null;
  }
}

// Fallback function to use the server API route instead of direct API call
export async function getServerTopScorers(leagueSlug: string) {
  try {
    console.log(`Using server API route for league: ${leagueSlug}`);
    
    const response = await fetch(`/api/scorers/${leagueSlug}`);
    
    if (!response.ok) {
      console.error(`Server API error: ${response.status} ${response.statusText}`);
      return null;
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching top scorers from server API:', error);
    return null;
  }
}

// Wrapper function to use the server API route for league standings
export async function getServerStandings(leagueSlug: string) {
  try {
    console.log(`Using server API route for standings: ${leagueSlug}`);
    
    const response = await fetch(`/api/standings/${leagueSlug}`);
    
    if (!response.ok) {
      console.error(`Server API error for standings: ${response.status} ${response.statusText}`);
      return null;
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching standings from server API:', error);
    return null;
  }
}

// Function to get Champions League knockout stage matches
export async function getChampionsLeagueKnockoutMatches() {
  try {
    console.log('Fetching Champions League knockout stage matches');
    
    const response = await fetch('https://api.football-data.org/v4/competitions/CL/matches?stage=ROUND_OF_16,QUARTER_FINALS,SEMI_FINALS,FINAL', options);
    const result = await handleApiResponse(response, 'Champions League Knockout Stage');
    
    if (result.error) {
      console.error(result.error);
      return null;
    }
    
    return result.matches;
  } catch (error) {
    console.error('Error fetching Champions League knockout matches:', error);
    return null;
  }
}

// Function to get upcoming matches for a specific team
export async function getTeamUpcomingMatches(teamId: number, limit: number = 3) {
  try {
    // Get current date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Get date 30 days from now
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const futureDateString = futureDate.toISOString().split('T')[0];
    
    console.log(`Fetching upcoming matches for team ID: ${teamId} from ${today} to ${futureDateString}`);
    
    const response = await fetch(
      `https://api.football-data.org/v4/teams/${teamId}/matches?status=SCHEDULED&dateFrom=${today}&dateTo=${futureDateString}&limit=${limit}`, 
      options
    );
    
    const result = await handleApiResponse(response, `Team Upcoming Matches (${teamId})`);
    
    if (result.error) {
      console.error(result.error);
      return [];
    }
    
    return result.matches || [];
  } catch (error) {
    console.error(`Error fetching upcoming matches for team ${teamId}:`, error);
    return [];
  }
}