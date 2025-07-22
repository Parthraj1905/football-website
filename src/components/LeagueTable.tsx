import Competition from './Competition'
import {matchesType} from '@/types'
import Matches from './Matches'

interface LeagueTableProps {
  data: matchesType
  isLive?: boolean
  showDate?: boolean
}

const LeagueTable = ({ data, isLive = false, showDate = false }: LeagueTableProps) => {
  // Format date to display if showDate is true
  const matchDate = showDate && data?.utcDate ? new Date(data.utcDate).toLocaleDateString() : null;
  
  return (
    <div className={`py-3 px-2 md:px-3 rounded-md flex flex-col bg-[rgb(40,46,58)] mb-2 ${isLive ? 'border-l-4 border-red-500' : ''}`}>
      {showDate && matchDate && (
        <div className="mb-2 text-xs text-gray-400">
          {matchDate}
        </div>
      )}
      <Competition data={data} />
      <Matches data={data} isLive={isLive} />
      {isLive && (
        <div className="mt-2 flex items-center">
          <span className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
          <span className="text-xs text-red-400">Live Match</span>
        </div>
      )}
    </div>
  )
}

export default LeagueTable