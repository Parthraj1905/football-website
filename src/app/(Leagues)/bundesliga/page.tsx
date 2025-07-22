import { filterLeague } from '@/api'
import { renderLeagueMatches } from '@/utils/leaguePageHelper'

const Bundesliga = async () => {
  const getBundesliga = await filterLeague('Bundesliga')
  return renderLeagueMatches(getBundesliga, 'Bundesliga')
}

export default Bundesliga