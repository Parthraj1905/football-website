import { NextResponse } from 'next/server';

// Map of league slugs to league codes
const leagueMappings: { [key: string]: string } = {
  'premier-league': 'PL',
  'la-liga': 'PD',
  'bundesliga': 'BL1',
  'serie-a': 'SA',
  'ligue-1': 'FL1',
  'championship': 'ELC',
  'primeira-liga': 'PPL',
  'champions-league': 'CL'
};

// Server-side API proxy to hide the API token from client
export async function GET(
  request: Request,
  { params }: { params: { league: string } }
) {
  try {
    const league = params.league;
    
    // Get the API code for the league
    const leagueCode = leagueMappings[league];
    
    if (!leagueCode) {
      return NextResponse.json(
        { error: `Unknown league: ${league}` },
        { status: 400 }
      );
    }
    
    // Fetch from the football-data API with server-side token
    const API_TOKEN = process.env.API_TOKEN;
    
    if (!API_TOKEN) {
      console.error('API_TOKEN environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    // Log debug info
    console.log(`Fetching top scorers for ${league} (${leagueCode})`);
    
    const response = await fetch(
      `https://api.football-data.org/v4/competitions/${leagueCode}/scorers`,
      {
        headers: {
          'X-Auth-Token': API_TOKEN,
          'Content-Type': 'application/json',
        },
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    );
    
    // Debug headers
    const rateLimit = response.headers.get('X-Requests-Available-Minute');
    console.log(`API Rate limit remaining: ${rateLimit}`);
    
    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      
      // Get error details if possible
      let errorDetails = null;
      try {
        errorDetails = await response.json();
      } catch (e) {
        // Ignore parsing errors
      }
      
      // Return error response with appropriate status
      return NextResponse.json(
        { 
          error: `Football data API error: ${response.status} ${response.statusText}`,
          details: errorDetails,
          isRateLimited: response.status === 429 || rateLimit === '0'
        },
        { status: response.status }
      );
    }
    
    // Get the JSON data
    const data = await response.json();
    
    // Return the data as JSON
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error in scorers API route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
} 