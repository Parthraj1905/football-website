import { filterLeague } from '@/api'
import { renderLeagueMatches } from '@/utils/leaguePageHelper'

const Championship = async () => {
  const getChampionship = await filterLeague('Championship')
  return renderLeagueMatches(getChampionship, 'Championship')
}

export default Championship