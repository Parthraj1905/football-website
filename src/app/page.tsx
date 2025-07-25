import { getMatchesfootball, getMatchesfootballFinished, getLiveMatches, getMatchesOlderFinished, getUpcomingMatches } from "@/api"
import Status from "@/components/Status"
import RefreshButton from "@/components/RefreshButton"

export default async function Home() {
  const getDatas = await getMatchesfootball()
  const getDatasFinished = await getMatchesfootballFinished()
  const getLiveData = await getLiveMatches()
  const getOlderFinishedData = await getMatchesOlderFinished()
  const getUpcomingData = await getUpcomingMatches()

  const matchesDatas = getDatas?.matches || []
  const matchesDatasFinished = getDatasFinished?.matches || []
  const liveMatchesDatas = getLiveData?.matches || []
  const olderFinishedMatches = getOlderFinishedData?.matches || []
  const upcomingMatches = getUpcomingData?.matches || []

  const nd = new Date()
  const dateConvert = nd.toDateString()

  return (
    <section className="px-2 md:px-4 md:w-[600px]">
      <div className="flex justify-between items-center mb-4 md:mb-2">
        <h1 className="text-md md:text-xl font-bold">MATCHES</h1>
        <div className="flex items-center gap-2">
          <RefreshButton />
          <div className="px-4 py-0 md:py-1 bg-slate-600 rounded-md text-textPrimary text-sm">
            <p>{`${dateConvert}`}</p>
          </div>
        </div>
      </div>
      <Status 
        matchesList={matchesDatas} 
        matchesListFinished={matchesDatasFinished} 
        liveMatches={liveMatchesDatas}
        olderFinishedMatches={olderFinishedMatches}
        upcomingMatches={upcomingMatches}
      />
    </section>
  )
}
