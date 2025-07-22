import { filterLeague } from '@/api'
import { renderLeagueMatches } from '@/utils/leaguePageHelper'

const Ligue1 = async () => {
  const getLigue1 = await filterLeague('Ligue 1')
  return renderLeagueMatches(getLigue1, 'Ligue 1')
}

export default Ligue1