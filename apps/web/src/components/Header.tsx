import { Link } from 'react-router-dom';

function IconUser() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 z-50 flex items-center px-4 gap-4 bg-card border-b border-border/40">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-white text-sm select-none">
          M
        </div>
        <span className="font-bold text-lg tracking-tight text-foreground">
          Master<span className="text-primary">bet</span>
        </span>
      </Link>

      {/* Center tagline — hidden on small screens */}
      <span className="hidden md:block text-xs text-muted-foreground ml-2">
        Compara cuotas en Colombia
      </span>

      <div className="ml-auto flex items-center gap-2">
        {/* Tier badge placeholder — shows current plan */}
        <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground bg-accent px-2.5 py-1 rounded-full border border-border/40">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Gratis
        </span>

        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-accent transition-colors">
          <IconUser />
          <span className="hidden sm:inline">Iniciar sesión</span>
        </button>

        <button className="text-sm bg-primary text-white px-4 py-1.5 rounded-lg hover:bg-primary/90 font-medium transition-colors">
          Registrarse
        </button>
      </div>
    </header>
  );
}
