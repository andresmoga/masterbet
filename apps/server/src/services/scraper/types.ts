export interface OddsData {
  bookmaker: string;
  homeOdds: number;
  drawOdds: number | null;
  awayOdds: number | null;
  over25Odds: number | null;
  under25Odds: number | null;
  scrapedAt: Date;
}

export interface MatchData {
  homeTeam: string;
  awayTeam: string;
  matchDate: Date;
  league: string;
  odds: OddsData[];
}

export interface ScraperResult {
  bookmaker: string;
  success: boolean;
  matchesFound: number;
  error?: string;
  matches: MatchData[];
}

export interface IScraper {
  name: string;
  url: string;
  scrape(): Promise<ScraperResult>;
}
