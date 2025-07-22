export type apiOptions = {
  next: any,
  headers:{
      'X-Auth-Token': string | any,
      'Content-Type': string | any
  }
}

export type matchesArea = {
  id?: number,
  name: string,
}
export type matchesCompetition = {
  id?: number,
  name: string,
  emblem: string
}
export type matchesHomeTeam = {
  id?: number,
  name: string,
  shortName?: string,
  crest: string,
  coach?: {
    id: number,
    name: string
  }
}
export type matchesAwayTeam = {
  id?: number,
  name: string,
  shortName?: string,
  crest: string,
  coach?: {
    id: number,
    name: string
  }
}
export type scores = {
  fullTime: {
      home: number,
      away: number,
  },
  halfTime?: {
    home: number,
    away: number,
  }
}

export type matchesType = {
  area: matchesArea,
  competition: matchesCompetition,
  id: number,
  utcDate: string,
  status: string,
  minute?: string | number,
  homeTeam: matchesHomeTeam,
  awayTeam: matchesAwayTeam,
  score: scores,
  penalties?: scores,
  extraTime?: scores,
  lastUpdated?: string,
  matchday?: number,
  stage?: string,
  group?: string
}

export type newsSourceType = {
  id?: string,
  name?: string
}

export type newsType = {
  title: string,
  url: string,
  urlToImage: string,
  description?: string,
  content?: string,
  publishedAt?: string,
  author?: string,
  source?: newsSourceType
}