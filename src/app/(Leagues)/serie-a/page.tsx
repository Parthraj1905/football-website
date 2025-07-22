import { filterLeague } from '@/api'
import { renderLeagueMatches } from '@/utils/leaguePageHelper'

const SerieA = async () => {
  const getSerieA = await filterLeague('Serie A')
  return renderLeagueMatches(getSerieA, 'Serie A')
}

export default SerieA