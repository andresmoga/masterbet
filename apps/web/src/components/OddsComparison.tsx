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

function getBestValue(values: (number | null)[]): number | null {
  const nums = values.filter((v): v is number => v !== null);
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

  const bookmakers = Array.from(
    new Set(data.flatMap((m) => Object.keys(m.odds)))
  ).sort();

  const leagueGroups = groupByLeague(data);

  return (
    <div className="space-y-4 w-full overflow-x-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between px-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚽</span>
          <h2 className="font-semibold text-foreground">Fútbol Colombia</h2>
          <span className="text-xs bg-accent text-muted-foreground px-2 py-0.5 rounded-full">
            {data.length} partidos
          </span>
        </div>
        {dataUpdatedAt > 0 && (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {new Date(dataUpdatedAt).toLocaleTimeString('es-CO')}
          </span>
        )}
      </div>

      {/* League sections */}
      {Array.from(leagueGroups.entries()).map(([league, leagueMatches]) => (
        <div key={league} className="rounded-xl overflow-hidden border border-border/30" style={{ minWidth: `${220 + bookmakers.length * 180}px` }}>

          {/* League header */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-card/80">
            <span className="text-sm">🇨🇴</span>
            <span className="text-sm font-semibold text-foreground">{league}</span>
            <span className="ml-auto text-xs text-muted-foreground">{leagueMatches.length} partido{leagueMatches.length !== 1 ? 's' : ''}</span>
          </div>

          {/* Column header row */}
          <div className="flex bg-background/50 border-y border-border/20 text-xs text-muted-foreground/60">
            <div className="w-20 shrink-0 px-3 py-2 text-center">Hora</div>
            <div className="flex-1 px-3 py-2">Partido</div>
            {bookmakers.map((bm) => (
              <div key={bm} className="w-44 shrink-0 flex flex-col items-center py-2 border-l border-border/20">
                <span className="text-primary/80 font-medium">{bm}</span>
                <div className="flex w-full justify-around mt-0.5 px-1">
                  <span>1</span><span>X</span><span>2</span>
                </div>
              </div>
            ))}
          </div>

          {/* Match rows */}
          {leagueMatches.map((match, idx) => {
            const bestHome = getBestValue(Object.values(match.odds).map((o) => o.home));
            const bestDraw = getBestValue(Object.values(match.odds).map((o) => o.draw));
            const bestAway = getBestValue(Object.values(match.odds).map((o) => o.away));

            return (
              <div
                key={match.matchId}
                className={`flex items-stretch hover:bg-secondary/50 transition-colors ${
                  idx < leagueMatches.length - 1 ? 'border-b border-border/20' : ''
                }`}
              >
                {/* Time */}
                <div className="w-20 shrink-0 flex flex-col items-center justify-center px-2 py-3 border-r border-border/10">
                  <span className="text-xs font-semibold text-primary/90 leading-tight">
                    {formatTime(match.matchDate)}
                  </span>
                  <span className="text-[10px] text-muted-foreground/50 mt-0.5">
                    {formatDate(match.matchDate)}
                  </span>
                </div>

                {/* Teams */}
                <div className="flex-1 px-4 py-3 flex flex-col justify-center min-w-0">
                  <span className="text-sm font-medium text-foreground truncate">{match.homeTeam}</span>
                  <span className="text-sm text-muted-foreground truncate mt-0.5">{match.awayTeam}</span>
                </div>

                {/* Odds per bookmaker */}
                {bookmakers.map((bm) => {
                  const o = match.odds[bm];
                  return (
                    <div key={bm} className="w-44 shrink-0 flex items-center gap-1 px-2 py-2 border-l border-border/20">
                      <OddsButton
                        value={o?.home ?? null}
                        isBest={!!o?.home && o.home === bestHome}
                        label="1"
                      />
                      <OddsButton
                        value={o?.draw ?? null}
                        isBest={!!o?.draw && o.draw === bestDraw}
                        label="X"
                      />
                      <OddsButton
                        value={o?.away ?? null}
                        isBest={!!o?.away && o.away === bestAway}
                        label="2"
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function OddsButton({ value, isBest, label }: { value: number | null; isBest: boolean; label: string }) {
  return (
    <button
      className={`
        flex-1 rounded-md flex flex-col items-center justify-center py-2 px-0.5 text-xs
        transition-all duration-150 select-none
        ${value === null
          ? 'bg-accent/20 text-muted-foreground/25 cursor-default'
          : isBest
            ? 'bg-green-500/15 border border-green-500/40 text-green-400 font-bold hover:bg-green-500/25 cursor-pointer'
            : 'bg-accent text-foreground/85 hover:bg-accent/70 hover:text-primary cursor-pointer border border-transparent hover:border-primary/20'
        }
      `}
      disabled={value === null}
    >
      <span className="text-[9px] text-muted-foreground/40 leading-none mb-0.5">{label}</span>
      <span className="font-mono tabular-nums leading-none text-sm">
        {value !== null ? value.toFixed(2) : '—'}
      </span>
    </button>
  );
}
