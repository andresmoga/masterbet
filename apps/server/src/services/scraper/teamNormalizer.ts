import fuzzball from 'fuzzball';
import { logger } from '../../utils/logger';
import { BOOKMAKER_TEAM_ALIASES } from './teamBookmakerMap';

// Common team name variations and aliases
const TEAM_ALIASES: Record<string, string[]> = {
  // Colombian Liga BetPlay Dimayor teams
  'América de Cali': ['America', 'America Cali', 'America de Cali', 'Diablos Rojos', 'América'],
  'Atlético Nacional': ['Atletico Nacional', 'Atl. Nacional', 'Verdolaga'],
  // ⚠️ 'Nacional' removed — conflicts with Uruguayan Nacional in BOOKMAKER_TEAM_ALIASES
  'Deportivo Cali': ['Cali', 'Dep. Cali', 'Deportivo Cali', 'Azucareros'],
  'Millonarios': ['Millonarios FC', 'Millos', 'Embajador', 'Millonarios F.C.'],
  'Independiente Santa Fe': ['Santa Fe', 'Ind. Santa Fe', 'Independiente SF', 'León', 'Independiente Santa Fe'],
  'Deportes Tolima': ['Tolima', 'Dep. Tolima', 'Vinotinto y Oro', 'Deportes Tolima'],
  'Deportivo Pereira': ['Pereira', 'Dep. Pereira', 'Matecaña', 'Deportivo Pereira'],
  'Junior de Barranquilla': ['Junior', 'Junior FC', 'Tiburón', 'CD Junior', 'Junior Barranquilla', 'Atlético Junior'],
  'Once Caldas': ['Once Caldas', 'Blanco Blanco', 'Once'],
  'Atlético Bucaramanga': ['Bucaramanga', 'Atl. Bucaramanga', 'Leopardo', 'Atletico Bucaramanga'],
  'Boyacá Chicó FC': [
    'Boyaca Chico', 'Boyacá Chicó', 'Boyaca Chicó', 'Boyacá Chico',
    'Boyaca Chico FC', 'Boyacá Chicó FC', 'Chicó', 'Chico FC', 'Boyacá Chicó F.C.',
  ],
  'Independiente Medellín': [
    'Independiente Medellin', 'Ind. Medellin', 'DIM', 'Rojo',
    'Independiente Medellín', 'Medellin', 'Medellín',
  ],
  'Jaguares de Córdoba': [
    'Jaguares', 'Jaguares FC', 'Jaguares De Córdoba', 'Jaguares de Cordoba',
    'Jaguares Córdoba', 'Jaguares Cordoba',
  ],
  'Deportivo Pasto': ['Pasto', 'Dep. Pasto', 'Negriazules', 'Deportivo Pasto'],
  'Cúcuta Deportivo': [
    'Cucuta', 'Cucuta Deportivo', 'Cúcuta', 'Cucuta Dep.',
    'Cúcuta Deportivo', 'Motilones',
  ],
  'Águilas Doradas Rionegro': [
    'Aguilas Doradas', 'Águilas Doradas', 'Aguilas Doradas Rionegro',
    'Águilas Doradas Rionegro', 'Rionegro', 'Rionegro Águilas',
  ],
  'Fortaleza FC': ['Fortaleza', 'Fortaleza CEIF', 'Fortaleza F.C.'],
  'Alianza FC': ['Alianza', 'Alianza Petrolera', 'Alianza F.C.'],
  'La Equidad': ['Equidad', 'La Equidad Seguros', 'Seguros La Equidad'],
  'Patriotas Boyacá': ['Patriotas', 'Patriotas FC', 'Patriotas Boyaca'],
  'Unión Magdalena': ['Union Magdalena', 'Unión', 'Magdalena'],
  'Llaneros FC': ['Llaneros', 'Llaneros F.C.'],
  'Internacional de Bogotá': ['Internacional', 'Inter Bogota', 'Internacional Bogota'],

  // International teams
  'Real Madrid': ['Real Madrid CF', 'R. Madrid', 'Madrid'],
  'FC Barcelona': ['Barcelona', 'Barça', 'FCB', 'Barca'],
  'Manchester United': ['Man United', 'Man Utd', 'ManU', 'United'],
  'Manchester City': ['Man City', 'MCFC', 'City'],
  'Bayern Munich': ['Bayern', 'FC Bayern', 'Bayern München'],
};

// Build reverse mapping for quick lookup
// Priority: BOOKMAKER_TEAM_ALIASES (explicit table) → TEAM_ALIASES (legacy)
const normalizedTeamMap = new Map<string, string>();

// 1. Legacy alias table
for (const [canonical, aliases] of Object.entries(TEAM_ALIASES)) {
  normalizedTeamMap.set(canonical.toLowerCase(), canonical);
  for (const alias of aliases) {
    normalizedTeamMap.set(alias.toLowerCase(), canonical);
  }
}

// 2. Cross-bookmaker table (takes priority — overwrites if there's a conflict)
for (const [canonical, aliases] of Object.entries(BOOKMAKER_TEAM_ALIASES)) {
  normalizedTeamMap.set(canonical.toLowerCase(), canonical);
  for (const alias of aliases) {
    normalizedTeamMap.set(alias.toLowerCase(), canonical);
  }
}

export function normalizeTeamName(teamName: string): string {
  const cleaned = teamName.trim();

  // 1. Exact lookup in combined map (covers both explicit tables)
  const exactMatch = normalizedTeamMap.get(cleaned.toLowerCase());
  if (exactMatch) {
    return exactMatch;
  }

  // 2. Fuzzy fallback — checks all entries in both tables
  let bestMatch: string | null = null;
  let bestScore = 0;

  const allEntries = [
    ...Object.entries(BOOKMAKER_TEAM_ALIASES),
    ...Object.entries(TEAM_ALIASES),
  ];

  for (const [canonical, aliases] of allEntries) {
    const canonicalScore = fuzzball.ratio(cleaned.toLowerCase(), canonical.toLowerCase());
    if (canonicalScore > bestScore) {
      bestScore = canonicalScore;
      bestMatch = canonical;
    }

    for (const alias of aliases) {
      const aliasScore = fuzzball.ratio(cleaned.toLowerCase(), alias.toLowerCase());
      if (aliasScore > bestScore) {
        bestScore = aliasScore;
        bestMatch = canonical;
      }
    }
  }

  if (bestMatch && bestScore >= 85) {
    logger.debug(`Fuzzy matched "${cleaned}" to "${bestMatch}" (score: ${bestScore})`);
    return bestMatch;
  }

  logger.debug(`No match found for "${cleaned}", using original`);
  return cleaned;
}

export function addTeamAlias(canonical: string, alias: string): void {
  if (!TEAM_ALIASES[canonical]) {
    TEAM_ALIASES[canonical] = [];
  }

  if (!TEAM_ALIASES[canonical].includes(alias)) {
    TEAM_ALIASES[canonical].push(alias);
    normalizedTeamMap.set(alias.toLowerCase(), canonical);
    logger.info(`Added alias "${alias}" for team "${canonical}"`);
  }
}
