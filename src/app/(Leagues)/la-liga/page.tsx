import { filterLeague } from '@/api'
import { renderLeagueMatches } from '@/utils/leaguePageHelper'

const LaLiga = async () => {
  const getLaLiga = await filterLeague('Primera Division')
  return renderLeagueMatches(getLaLiga, 'La Liga')
}

export default LaLiga