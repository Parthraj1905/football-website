import Image from 'next/image'
import { matchesType } from '@/types';

interface MatchesProps {
  data: matchesType | null
  isLive?: boolean
}

const Matches = ({data, isLive = false}: MatchesProps) => {
  if (!data) {
    return <p className="text-center py-2 text-red-400">Match data unavailable.</p>;
  }

  const getDate = new Date(data?.utcDate).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (!data.homeTeam || !data.awayTeam) {
    return <p className="text-center py-2 text-yellow-400">Match details incomplete.</p>;
  }

  return (
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
  )
}

export default Matches