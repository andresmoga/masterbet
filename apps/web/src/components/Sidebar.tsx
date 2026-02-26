import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

// ─── Inline SVG icons ────────────────────────────────────────────────────────
function IconScale() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18M3 9l9-6 9 6M3 15l9 6 9-6" />
      <line x1="3" y1="9" x2="3" y2="15" />
      <line x1="21" y1="9" x2="21" y2="15" />
    </svg>
  );
}
function IconTrophy() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4a2 2 0 0 1-2-2V5h4" />
      <path d="M18 9h2a2 2 0 0 0 2-2V5h-4" />
      <path d="M6 2h12v10a6 6 0 0 1-12 0Z" />
      <path d="M12 18v4" />
      <path d="M8 22h8" />
    </svg>
  );
}
function IconSoccer() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="m12 2 3 6-5 2-2-6 4-2Z" />
      <path d="m4.3 15 5-2 2 4-4 3-3-5Z" />
      <path d="m19.7 15-3-5 4 1 1 4h-2Z" />
    </svg>
  );
}
function IconBarChart() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}
function IconLightbulb() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5C18 10 19 8.7 19 7a7 7 0 0 0-14 0c0 1.7 1 3 2.5 4.5.8.8 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );
}
function IconTrendUp() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
function IconRobot() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8" y2="16" strokeWidth="3" />
      <line x1="16" y1="16" x2="16" y2="16" strokeWidth="3" />
    </svg>
  );
}
function IconWallet() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
      <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  );
}
function IconGem() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="6 3 18 3 22 9 12 22 2 9" />
      <polyline points="2 9 12 9 22 9" />
      <line x1="12" y1="3" x2="12" y2="9" />
    </svg>
  );
}
function IconLock() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
function IconChevron({ open }: { open: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      className={cn('transition-transform duration-200', open ? 'rotate-90' : '')}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
function IconFlag() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Tier = 'free' | 'pro' | 'elite';

interface LeagueItem {
  id: string;
  label: string;
  href?: string;
  soon?: boolean;
}

// ─── Tier badge ───────────────────────────────────────────────────────────────
const TIER_STYLES: Record<Tier, string> = {
  free: 'bg-green-500/15 text-green-400 border-green-500/30',
  pro: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  elite: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
};
const TIER_LABELS: Record<Tier, string> = {
  free: 'Gratis',
  pro: 'Pro',
  elite: 'Elite',
};

function TierBadge({ tier }: { tier: Tier }) {
  return (
    <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded border uppercase tracking-wide', TIER_STYLES[tier])}>
      {TIER_LABELS[tier]}
    </span>
  );
}

// ─── Locked section item ──────────────────────────────────────────────────────
function LockedItem({ icon, label, tier }: { icon: React.ReactNode; label: string; tier: 'pro' | 'elite' }) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2 mx-2 rounded-lg text-muted-foreground/40 cursor-not-allowed select-none">
      <span className="w-4 h-4 flex items-center justify-center shrink-0">{icon}</span>
      <span className="flex-1 text-sm">{label}</span>
      <IconLock />
    </div>
  );
}

// ─── League sub-item ─────────────────────────────────────────────────────────
function LeagueLink({ item }: { item: LeagueItem }) {
  if (item.soon || !item.href) {
    return (
      <div className="flex items-center gap-2 pl-10 pr-3 py-1.5 mx-2 rounded-md text-muted-foreground/40 cursor-not-allowed select-none">
        <IconFlag />
        <span className="flex-1 text-xs">{item.label}</span>
        <span className="text-[9px] text-muted-foreground/30 border border-muted-foreground/20 px-1 py-0.5 rounded uppercase tracking-wide">
          Próximamente
        </span>
      </div>
    );
  }
  return (
    <NavLink
      to={item.href}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2 pl-10 pr-3 py-1.5 mx-2 rounded-md text-xs transition-colors',
          isActive
            ? 'bg-primary/15 text-primary font-medium'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
        )
      }
    >
      <IconFlag />
      {item.label}
    </NavLink>
  );
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────
const LEAGUES: LeagueItem[] = [
  { id: 'liga-betplay', label: 'Liga BetPlay Colombia', href: '/comparar/futbol/liga-betplay' },
  { id: 'copa-colombia', label: 'Copa Colombia', soon: true },
  { id: 'sudamericana', label: 'Sudamericana', soon: true },
  { id: 'libertadores', label: 'Copa Libertadores', soon: true },
];

export function Sidebar() {
  const location = useLocation();
  const [sportsOpen, setSportsOpen] = useState(true);
  const [futbolOpen, setFutbolOpen] = useState(true);

  const isComparePath = location.pathname.startsWith('/comparar');

  return (
    <aside className="w-56 shrink-0 flex flex-col border-r border-border/40 bg-card/50 overflow-y-auto">
      <nav className="flex-1 py-3 space-y-0.5">

        {/* ── FREE section ── */}
        <div className="px-3 pb-1 pt-2">
          <span className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/40">
            Gratis
          </span>
        </div>

        {/* Comparar Cuotas */}
        <NavLink
          to="/comparar/futbol/liga-betplay"
          className={cn(
            'flex items-center gap-2.5 px-3 py-2 mx-2 rounded-lg text-sm transition-colors',
            isComparePath
              ? 'bg-primary/15 text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
          )}
        >
          <IconScale />
          <span className="flex-1">Comparar Cuotas</span>
        </NavLink>

        {/* Deportes expandable */}
        <div>
          <button
            onClick={() => setSportsOpen((v) => !v)}
            className="w-full flex items-center gap-2.5 px-3 py-2 mx-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
            style={{ width: 'calc(100% - 16px)' }}
          >
            <IconTrophy />
            <span className="flex-1 text-left">Deportes</span>
            <IconChevron open={sportsOpen} />
          </button>

          {sportsOpen && (
            <div className="mt-0.5">
              {/* Fútbol sub-section */}
              <button
                onClick={() => setFutbolOpen((v) => !v)}
                className="w-full flex items-center gap-2 pl-8 pr-3 py-1.5 mx-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
                style={{ width: 'calc(100% - 16px)' }}
              >
                <IconSoccer />
                <span className="flex-1 text-left text-sm">Fútbol</span>
                <IconChevron open={futbolOpen} />
              </button>

              {futbolOpen && (
                <div className="mt-0.5 space-y-0.5">
                  {LEAGUES.map((league) => (
                    <LeagueLink key={league.id} item={league} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mx-4 my-2 border-t border-border/30" />

        {/* ── PRO section ── */}
        <div className="px-3 pb-1 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/40">
              Pro
            </span>
            <TierBadge tier="pro" />
          </div>
        </div>

        <LockedItem icon={<IconBarChart />} label="Mis Apuestas" tier="pro" />
        <LockedItem icon={<IconLightbulb />} label="Sugerencias IA" tier="pro" />
        <LockedItem icon={<IconTrendUp />} label="Análisis de Rendimiento" tier="pro" />

        <div className="mx-4 my-2 border-t border-border/30" />

        {/* ── ELITE section ── */}
        <div className="px-3 pb-1 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/40">
              Elite
            </span>
            <TierBadge tier="elite" />
          </div>
        </div>

        <LockedItem icon={<IconRobot />} label="Agente de Apuestas IA" tier="elite" />
        <LockedItem icon={<IconBarChart />} label="Estadísticas Avanzadas" tier="elite" />
        <LockedItem icon={<IconWallet />} label="Control Financiero" tier="elite" />

      </nav>

      {/* ── Bottom: Plans CTA ── */}
      <div className="p-3 border-t border-border/30">
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/20 text-sm text-purple-300 hover:from-purple-500/30 hover:to-blue-500/30 transition-all">
          <IconGem />
          <span className="font-medium">Ver Planes</span>
        </button>
      </div>
    </aside>
  );
}
