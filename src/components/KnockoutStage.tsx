import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Match {
  id: number;
  homeTeam: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
  };
  awayTeam: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
  };
  score: {
    fullTime: {
      home: number | null;
      away: number | null;
    };
  };
  stage: string;
  group: string;
  utcDate: string;
  status: string;
}

interface KnockoutStageProps {
  matches: Match[];
}

export default function KnockoutStage({ matches }: KnockoutStageProps) {
  const [roundOf16, setRoundOf16] = useState<Match[]>([]);
  const [quarterFinals, setQuarterFinals] = useState<Match[]>([]);
  const [semiFinals, setSemiFinals] = useState<Match[]>([]);
  const [final, setFinal] = useState<Match | null>(null);

  useEffect(() => {
    // Filter matches by stage
    const roundOf16Matches = matches.filter(match => match.stage === 'ROUND_OF_16');
    const quarterFinalMatches = matches.filter(match => match.stage === 'QUARTER_FINALS');
    const semiFinalMatches = matches.filter(match => match.stage === 'SEMI_FINALS');
    const finalMatch = matches.find(match => match.stage === 'FINAL') || null;

    setRoundOf16(roundOf16Matches);
    setQuarterFinals(quarterFinalMatches);
    setSemiFinals(semiFinalMatches);
    setFinal(finalMatch);
  }, [matches]);

  const renderMatch = (match: Match) => {
    const isFinished = match.status === 'FINISHED';
    const isLive = match.status === 'LIVE' || match.status === 'IN_PROGRESS';
    
    return (
      <div key={match.id} className="bg-gray-800 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative w-8 h-8">
              <Image
                src={match.homeTeam.crest}
                alt={match.homeTeam.name}
                fill
                className="object-contain"
              />
            </div>
            <span className="font-medium">{match.homeTeam.shortName}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {isFinished ? (
              <span className="font-bold">
                {match.score.fullTime.home} - {match.score.fullTime.away}
              </span>
            ) : isLive ? (
              <span className="text-green-500 font-bold">LIVE</span>
            ) : (
              <span className="text-gray-400">vs</span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="font-medium">{match.awayTeam.shortName}</span>
            <div className="relative w-8 h-8">
              <Image
                src={match.awayTeam.crest}
                alt={match.awayTeam.name}
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-2 text-sm text-gray-400 text-center">
          {new Date(match.utcDate).toLocaleDateString()}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Round of 16 */}
      <div>
        <h2 className="text-xl font-bold mb-4">Round of 16</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roundOf16.map(match => renderMatch(match))}
        </div>
      </div>

      {/* Quarter Finals */}
      <div>
        <h2 className="text-xl font-bold mb-4">Quarter Finals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quarterFinals.map(match => renderMatch(match))}
        </div>
      </div>

      {/* Semi Finals */}
      <div>
        <h2 className="text-xl font-bold mb-4">Semi Finals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {semiFinals.map(match => renderMatch(match))}
        </div>
      </div>

      {/* Final */}
      {final && (
        <div>
          <h2 className="text-xl font-bold mb-4">Final</h2>
          <div className="max-w-md mx-auto">
            {renderMatch(final)}
          </div>
        </div>
      )}
    </div>
  );
} 