import { useQuery } from '@tanstack/react-query';

interface BookmakerOdds {
  home: number | null;
  draw: number | null;
  away: number | null;
  over25: number | null;
  under25: number | null;
}

interface MatchComparison {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  matchDate: string | null;
  league: string | null;
  odds: Record<string, BookmakerOdds>;
}

async function fetchOddsComparison(): Promise<MatchComparison[]> {
  const res = await fetch('/api/odds/comparison');
  if (!res.ok) throw new Error('Failed to fetch odds');
  const json = await res.json();
  return json.data;
}

function getBest(values: (number | null)[]): number | null {
  const nums = values.filter((v): v is number => v !== null && v > 0);
  return nums.length ? Math.max(...nums) : null;
}

function formatTime(dateStr: string | null) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
}

function groupByLeague(data: MatchComparison[]) {
  const map = new Map<string, MatchComparison[]>();
  for (const match of data) {
    const key = match.league || 'Sin liga';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(match);
  }
  return map;
}

// Column width per bookmaker (px) — compact enough for 7+ sites
const COL_W = 152;
// Fixed left section width
const LEFT_W = 210;

export function OddsComparison() {
  const { data, isLoading, isError, dataUpdatedAt } = useQuery({
    queryKey: ['odds-comparison'],
    queryFn: fetchOddsComparison,
    refetchInterval: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-3">
          <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">Cargando cuotas...</p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-2">
          <p className="text-red-400 font-medium">Error al cargar las cuotas</p>
          <p className="text-muted-foreground text-sm">Verifica que el servidor esté activo</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">No hay partidos disponibles aún</p>
          <p className="text-muted-foreground/60 text-sm">Los scrapers están recolectando datos...</p>
        </div>
      </div>
    );
  }

  // Bookmakers are discovered dynamically from data — adding a new scraper
  // automatically creates a new column without any code changes here.
  const bookmakers = Array.from(
    new Set(data.flatMap((m) => Object.keys(m.odds)))
  ).sort();

  const leagueGroups = groupByLeague(data);
  const tableMinWidth = LEFT_W + bookmakers.length * COL_W;

  return (
    <div className="space-y-4 w-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚽</span>
          <h2 className="font-semibold text-foreground">Fútbol Colombia</h2>
          <span className="text-xs bg-accent text-muted-foreground px-2 py-0.5 rounded-full">
            {data.length} partidos
          </span>
          <span className="text-xs bg-accent/50 text-muted-foreground px-2 py-0.5 rounded-full">
            {bookmakers.length} casas
          </span>
        </div>
        {dataUpdatedAt > 0 && (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            Act. {new Date(dataUpdatedAt).toLocaleTimeString('es-CO')}
          </span>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-1 text-[11px] text-muted-foreground/60">
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-green-500/30 border border-green-500/50" />
          Mejor cuota
        </span>
        <span>1X2 = Ganador · O/U = Más/Menos de 2.5 goles</span>
      </div>

      {/* Scrollable table area */}
      <div className="overflow-x-auto rounded-xl border border-border/30">
        <div style={{ minWidth: `${tableMinWidth}px` }}>

          {/* League sections */}
          {Array.from(leagueGroups.entries()).map(([league, leagueMatches]) => {
            return (
              <div key={league}>

                {/* League header */}
                <div className="flex items-center gap-2 px-4 py-2.5 bg-card/80 border-b border-border/20">
                  <span className="text-sm">🇨🇴</span>
                  <span className="text-sm font-semibold text-foreground">{league}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {leagueMatches.length} partido{leagueMatches.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Column header row */}
                <div className="flex bg-background/50 border-b border-border/20 text-xs text-muted-foreground/60">
                  <div className="shrink-0 flex" style={{ width: `${LEFT_W}px` }}>
                    <div className="w-16 px-2 py-2 text-center">Hora</div>
                    <div className="flex-1 px-3 py-2">Partido</div>
                  </div>
                  {bookmakers.map((bm) => (
                    <div
                      key={bm}
                      className="shrink-0 flex flex-col items-center py-1.5 border-l border-border/20"
                      style={{ width: `${COL_W}px` }}
                    >
                      <span className="text-primary/80 font-medium text-[11px] tracking-tight">{bm}</span>
                      <div className="flex w-full mt-1">
                        <div className="flex flex-1 justify-around px-1 border-r border-border/20 text-[10px]">
                          <span>1</span><span>X</span><span>2</span>
                        </div>
                        <div className="flex w-14 justify-around px-1 text-[10px]">
                          <span>O</span><span>U</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Match rows */}
                {leagueMatches.map((match, idx) => {
                  const bestHome  = getBest(Object.values(match.odds).map((o) => o.home));
                  const bestDraw  = getBest(Object.values(match.odds).map((o) => o.draw));
                  const bestAway  = getBest(Object.values(match.odds).map((o) => o.away));
                  const bestOver  = getBest(Object.values(match.odds).map((o) => o.over25));
                  const bestUnder = getBest(Object.values(match.odds).map((o) => o.under25));

                  return (
                    <div
                      key={match.matchId}
                      className={`flex items-stretch hover:bg-secondary/40 transition-colors ${
                        idx < leagueMatches.length - 1 ? 'border-b border-border/20' : ''
                      }`}
                    >
                      {/* Time + Teams */}
                      <div className="shrink-0 flex" style={{ width: `${LEFT_W}px` }}>
                        <div className="w-16 shrink-0 flex flex-col items-center justify-center px-1 py-3 border-r border-border/10">
                          <span className="text-xs font-semibold text-primary/90 leading-tight">
                            {formatTime(match.matchDate)}
                          </span>
                          <span className="text-[10px] text-muted-foreground/50 mt-0.5">
                            {formatDate(match.matchDate)}
                          </span>
                        </div>
                        <div className="flex-1 px-3 py-3 flex flex-col justify-center min-w-0">
                          <span className="text-sm font-medium text-foreground truncate">{match.homeTeam}</span>
                          <span className="text-sm text-muted-foreground truncate mt-0.5">{match.awayTeam}</span>
                        </div>
                      </div>

                      {/* Odds per bookmaker */}
                      {bookmakers.map((bm) => {
                        const o = match.odds[bm];
                        return (
                          <div
                            key={bm}
                            className="shrink-0 flex items-center border-l border-border/20 px-1 py-1.5 gap-0.5"
                            style={{ width: `${COL_W}px` }}
                          >
                            {/* 1X2 group */}
                            <div className="flex flex-1 gap-0.5">
                              <OddsCell value={o?.home ?? null}  isBest={!!o?.home  && o.home  === bestHome}  />
                              <OddsCell value={o?.draw ?? null}  isBest={!!o?.draw  && o.draw  === bestDraw}  />
                              <OddsCell value={o?.away ?? null}  isBest={!!o?.away  && o.away  === bestAway}  />
                            </div>
                            {/* Divider */}
                            <div className="w-px self-stretch bg-border/30 mx-0.5" />
                            {/* O/U 2.5 group */}
                            <div className="flex w-14 gap-0.5">
                              <OddsCell value={o?.over25  ?? null} isBest={!!o?.over25  && o.over25  === bestOver}  small />
                              <OddsCell value={o?.under25 ?? null} isBest={!!o?.under25 && o.under25 === bestUnder} small />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}

              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}

function OddsCell({
  value,
  isBest,
  small = false,
}: {
  value: number | null;
  isBest: boolean;
  small?: boolean;
}) {
  return (
    <button
      className={`
        flex-1 rounded flex items-center justify-center select-none transition-all duration-150
        ${small ? 'py-1.5 text-[11px]' : 'py-2 text-xs'}
        ${value === null
          ? 'bg-accent/15 text-muted-foreground/20 cursor-default'
          : isBest
            ? 'bg-green-500/15 border border-green-500/40 text-green-400 font-bold hover:bg-green-500/25 cursor-pointer'
            : 'bg-accent text-foreground/80 hover:bg-accent/70 hover:text-primary cursor-pointer border border-transparent hover:border-primary/20'
        }
      `}
      disabled={value === null}
    >
      <span className="font-mono tabular-nums leading-none">
        {value !== null ? value.toFixed(2) : '—'}
      </span>
    </button>
  );
}
