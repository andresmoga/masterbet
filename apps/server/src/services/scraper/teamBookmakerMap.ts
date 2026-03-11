/**
 * Cross-bookmaker team name mapping table.
 *
 * CANONICAL name (key) = exactly what Google shows — this is what gets stored in the DB.
 * ALIASES = every name variant any bookmaker (Wplay, BetPlay, Rushbet, Betsson, Bwin, Betano) uses.
 *
 * Rules:
 *  - One entry per real-world team, regardless of which competitions they appear in.
 *  - Aliases must cover ALL bookmaker spellings you've observed.
 *  - This table takes priority over the legacy TEAM_ALIASES in teamNormalizer.ts.
 *  - Audit endpoint: GET /api/odds/team-map
 *
 * ⚠️  KNOWN CONFLICTS TO WATCH:
 *  - 'Atlético Nacional' (COL) vs 'Nacional' (URU) — do NOT add plain 'Nacional' to the Colombian entry
 *  - 'Fortaleza FC' (COL) vs 'Fortaleza' (BRA)
 *  - 'Alianza FC' (COL) vs 'Alianza Lima' (PER)
 *  - 'Internacional de Bogotá' (COL) vs 'Internacional' (BRA)
 */

export const BOOKMAKER_TEAM_ALIASES: Record<string, string[]> = {

  // ════════════════════════════════════════════════════════════════════════════
  // COLOMBIA — Liga BetPlay Dimayor
  // ════════════════════════════════════════════════════════════════════════════

  'América de Cali': [
    'America', 'America Cali', 'America de Cali', 'Diablos Rojos', 'América',
    'America De Cali',
  ],
  'Atlético Nacional': [
    'Atletico Nacional', 'Atl. Nacional', 'Verdolaga',
    'Club Atletico Nacional', 'Nacional COL',
    // ⚠️ Do NOT add plain "Nacional" — conflicts with Uruguayan Nacional below
  ],
  'Deportivo Cali': [
    'Cali', 'Dep. Cali', 'Azucareros',
  ],
  'Millonarios': [
    'Millonarios FC', 'Millos', 'Embajador', 'Millonarios F.C.',
    'Millonarios FC Bogota',
  ],
  'Independiente Santa Fe': [
    'Santa Fe', 'Ind. Santa Fe', 'Independiente SF', 'León',
    'Club Independiente Santa Fe', 'Santafe',
  ],
  'Deportes Tolima': [
    'Tolima', 'Dep. Tolima', 'Vinotinto y Oro',
  ],
  'Deportivo Pereira': [
    'Pereira', 'Dep. Pereira', 'Matecaña', 'Deportivo Pereira FC',
  ],
  'Junior de Barranquilla': [
    'Junior', 'Junior FC', 'Tiburón', 'CD Junior', 'Junior Barranquilla',
    'Atlético Junior', 'Atletico Junior', 'Junior FC Barranquilla',
  ],
  'Once Caldas': [
    'Blanco Blanco', 'Once', 'Once Caldas FC',
  ],
  'Atlético Bucaramanga': [
    'Bucaramanga', 'Atl. Bucaramanga', 'Leopardo', 'Atletico Bucaramanga',
  ],
  'Boyacá Chicó FC': [
    'Boyaca Chico', 'Boyacá Chicó', 'Boyaca Chicó', 'Boyacá Chico',
    'Boyaca Chico FC', 'Boyacá Chicó FC', 'Chicó', 'Chico FC',
    'Boyacá Chicó F.C.',
  ],
  'Independiente Medellín': [
    'Independiente Medellin', 'Ind. Medellin', 'DIM',
    'Independiente Medellín', 'Medellin', 'Medellín',
    'Club Independiente Medellin',
  ],
  'Jaguares de Córdoba': [
    'Jaguares', 'Jaguares FC', 'Jaguares De Córdoba', 'Jaguares de Cordoba',
    'Jaguares Córdoba', 'Jaguares Cordoba',
  ],
  'Deportivo Pasto': [
    'Pasto', 'Dep. Pasto', 'Negriazules',
  ],
  'Cúcuta Deportivo': [
    'Cucuta', 'Cucuta Deportivo', 'Cúcuta', 'Cucuta Dep.', 'Motilones',
  ],
  'Águilas Doradas Rionegro': [
    'Aguilas Doradas', 'Águilas Doradas', 'Aguilas Doradas Rionegro',
    'Rionegro', 'Rionegro Águilas',
  ],
  'Fortaleza FC': [
    'Fortaleza CEIF', 'Fortaleza F.C.',
    // ⚠️ Plain 'Fortaleza' is reserved for Brazilian club below
  ],
  'Alianza FC': [
    'Alianza Petrolera', 'Alianza F.C.',
    // ⚠️ Plain 'Alianza' — add here if a bookmaker uses it for the Colombian club
  ],
  'La Equidad': [
    'Equidad', 'La Equidad Seguros', 'Seguros La Equidad',
  ],
  'Patriotas Boyacá': [
    'Patriotas', 'Patriotas FC', 'Patriotas Boyaca',
  ],
  'Unión Magdalena': [
    'Union Magdalena', 'Magdalena',
    // ⚠️ Plain 'Unión' is too generic — omitted
  ],
  'Llaneros FC': [
    'Llaneros', 'Llaneros F.C.',
  ],
  'Internacional de Bogotá': [
    'Inter Bogota', 'Internacional Bogota',
    // ⚠️ Plain 'Internacional' is reserved for Brazilian club below
  ],

  // ════════════════════════════════════════════════════════════════════════════
  // CONMEBOL Libertadores — South America
  // ════════════════════════════════════════════════════════════════════════════
  // Colombia teams: already listed above (Atlético Nacional, América, Tolima, Pereira, Junior)

  // ── Argentina ─────────────────────────────────────────────────────────────
  'River Plate': [
    'Club River Plate', 'River', 'River Plate ARG',
  ],
  'Boca Juniors': [
    'Club Atlético Boca Juniors', 'Boca', 'Boca Juniors ARG',
  ],
  'Racing Club': [
    'Racing Club ARG', 'Racing ARG', 'Club Racing', 'Racing',
  ],
  'Estudiantes': [
    'Estudiantes LP', 'Estudiantes de La Plata', 'Club Estudiantes',
    'Estudiantes (LP)', 'Estudiantes La Plata',
  ],
  'San Lorenzo': [
    'San Lorenzo ARG', 'Club San Lorenzo', 'San Lorenzo de Almagro', 'CASLA',
  ],
  'Independiente': [
    'Independiente ARG', 'Club Independiente', 'Independiente Avellaneda',
  ],
  'Talleres': [
    'Talleres Córdoba', 'Talleres CBA', 'Club Talleres', 'Talleres de Córdoba',
  ],
  'Vélez Sársfield': [
    'Velez', 'Vélez', 'Velez Sarsfield', 'Club Vélez Sársfield',
  ],
  'Lanús': [
    'Lanus', 'Club Atlético Lanús',
  ],
  'Huracán': [
    'Huracan', 'Club Atlético Huracán',
  ],

  // ── Brazil ────────────────────────────────────────────────────────────────
  'Botafogo': [
    'Botafogo FR', 'Botafogo RJ', 'Botafogo de Futebol e Regatas',
  ],
  'Flamengo': [
    'CR Flamengo', 'Flamengo RJ', 'Clube de Regatas do Flamengo',
  ],
  'Fluminense': [
    'Fluminense FC', 'Fluminense RJ',
  ],
  'Palmeiras': [
    'SE Palmeiras', 'Sociedade Esportiva Palmeiras',
  ],
  'Atlético Mineiro': [
    'Atletico Mineiro', 'Atlético MG', 'Atletico MG', 'Galo',
    'Club Atletico Mineiro',
  ],
  'Grêmio': [
    'Gremio', 'Grêmio FBP', 'Gremio FBP', 'Grêmio Porto Alegre',
  ],
  'Internacional': [
    'Internacional Porto Alegre', 'SC Internacional', 'Inter BRA',
    'Internacional BRA', 'Sport Club Internacional',
    // ⚠️ Do NOT add plain 'Internacional' — conflicts with 'Internacional de Bogotá'
  ],
  'São Paulo': [
    'Sao Paulo', 'São Paulo FC', 'Sao Paulo FC', 'SPFC',
  ],
  'Corinthians': [
    'SC Corinthians', 'Sport Club Corinthians Paulista',
  ],
  'Cruzeiro': [
    'Cruzeiro EC', 'Cruzeiro Esporte Clube',
  ],
  'Athletico Paranaense': [
    'Athletico PR', 'Atletico Paranaense', 'Atletico PR',
    'Club Athletico Paranaense', 'Furacão',
  ],
  'Fortaleza': [
    'Fortaleza EC', 'Fortaleza BRA',
    // ⚠️ NOT the same as Colombian 'Fortaleza FC' above
  ],

  // ── Uruguay ───────────────────────────────────────────────────────────────
  'Peñarol': [
    'Club Atletico Peñarol', 'CA Peñarol', 'Peñarol URU', 'Penarol',
  ],
  'Nacional': [
    'Club Nacional', 'Nacional URU', 'Nacional de Football',
    'Nacional Montevideo',
    // ⚠️ Do NOT add plain 'Nacional' for Atlético Nacional (COL) — see above
  ],
  'Juventud de Las Piedras': [
    'Juventud', 'Juventud LP', 'Juventud Las Piedras', 'Club Juventud',
    'C.A. Juventud',
  ],
  'Defensor Sporting': [
    'Defensor', 'Defensor SC', 'Club Defensor Sporting',
  ],

  // ── Chile ─────────────────────────────────────────────────────────────────
  'Colo-Colo': [
    'Club Social y Deportivo Colo-Colo', 'Colo Colo',
  ],
  'Universidad de Chile': [
    'U de Chile', 'U. de Chile', 'Club Universidad de Chile', 'La U',
  ],
  'O\'Higgins': [
    'CD O\'Higgins', 'O\'Higgins FC', 'Club O\'Higgins', 'O Higgins',
  ],
  'Universidad Católica': [
    'U. Católica', 'U Católica', 'U Catolica', 'Universidad Católica CHI',
    'Club Deportivo Universidad Católica',
  ],
  'Huachipato': [
    'CF Huachipato', 'Huachipato FC',
  ],

  // ── Ecuador ───────────────────────────────────────────────────────────────
  'Barcelona SC': [
    'FC Barcelona SC', 'Barcelona Sporting Club', 'Barcelona Ecuador',
  ],
  'Liga de Quito': [
    'LDU Quito', 'Liga Deportiva Universitaria', 'LDU', 'Liga de Quito EC',
  ],
  'Independiente del Valle': [
    'Ind. del Valle', 'IDV', 'Independiente Valle',
  ],
  'Aucas': [
    'SD Aucas', 'Sociedad Deportiva Aucas',
  ],
  'El Nacional': [
    'Club El Nacional',
  ],

  // ── Peru ──────────────────────────────────────────────────────────────────
  'Universitario': [
    'Universitario de Deportes', 'Universitario Peru', 'Club Universitario',
    'La U Peru',
  ],
  'Sporting Cristal': [
    'Club Sporting Cristal', 'S. Cristal',
  ],
  'Alianza Lima': [
    'Club Alianza Lima', 'Alianza Peru',
    // ⚠️ NOT the same as Colombian 'Alianza FC'
  ],
  'FBC Melgar': [
    'Melgar', 'FBC Melgar Arequipa', 'Melgar Arequipa',
  ],

  // ── Venezuela ─────────────────────────────────────────────────────────────
  'Carabobo FC': [
    'Carabobo', 'CD Carabobo', 'Carabobo F.C.',
  ],
  'Caracas FC': [
    'Caracas', 'Club Caracas FC',
  ],
  'Deportivo Táchira': [
    'Tachira', 'Táchira', 'Deportivo Tachira', 'CD Táchira',
  ],
  'Monagas SC': [
    'Monagas', 'Monagas Sport Club',
  ],

  // ── Bolivia ───────────────────────────────────────────────────────────────
  'The Strongest': [
    'Club The Strongest', 'The Strongest BOL',
  ],
  'Bolívar': [
    'Club Bolívar', 'Club Bolivar', 'Bolivar',
  ],

  // ── Paraguay ──────────────────────────────────────────────────────────────
  'Olimpia': [
    'Club Olimpia', 'Olimpia PAR',
  ],
  'Cerro Porteño': [
    'Cerro', 'Cerro Porteno', 'Club Cerro Porteño',
  ],
  'Libertad': [
    'Club Libertad', 'Libertad PAR',
  ],
  'Guaraní': [
    'Club Guaraní', 'Guarani',
  ],

  // ════════════════════════════════════════════════════════════════════════════
  // UEFA CHAMPIONS LEAGUE
  // ════════════════════════════════════════════════════════════════════════════

  'Real Madrid': [
    'Real Madrid CF', 'R. Madrid', 'Madrid',
  ],
  'FC Barcelona': [
    'Barcelona', 'Barça', 'FCB', 'Barca', 'FC Barcelona ESP',
  ],
  'Manchester City': [
    'Man City', 'MCFC', 'City', 'Manchester City FC',
  ],
  'Manchester United': [
    'Man United', 'Man Utd', 'ManU', 'United', 'Manchester United FC',
  ],
  'Bayern Munich': [
    'Bayern', 'FC Bayern', 'Bayern München', 'FC Bayern München',
  ],
  'Paris Saint-Germain': [
    'PSG', 'Paris SG', 'Paris Saint Germain', 'Paris S.G.',
  ],
  'Liverpool': [
    'Liverpool FC', 'The Reds', 'LFC',
  ],
  'Chelsea': [
    'Chelsea FC', 'CFC',
  ],
  'Arsenal': [
    'Arsenal FC', 'The Gunners', 'AFC',
  ],
  'Tottenham Hotspur': [
    'Tottenham', 'Spurs', 'Tottenham Hotspur FC',
  ],
  'Borussia Dortmund': [
    'BVB', 'Dortmund', 'B. Dortmund', 'BVB 09',
  ],
  'RB Leipzig': [
    'Leipzig', 'Rasenballsport Leipzig', 'RBL',
  ],
  'Bayer Leverkusen': [
    'Leverkusen', 'B. Leverkusen', 'Bayer 04',
  ],
  'Atlético Madrid': [
    'Atletico Madrid', 'Atlético de Madrid', 'Atletico de Madrid', 'Atl. Madrid',
  ],
  'Sevilla': [
    'Sevilla FC', 'Sevilla CF',
  ],
  'Villarreal': [
    'Villarreal CF',
  ],
  'Inter Milan': [
    'Internazionale', 'Inter', 'FC Internazionale', 'Inter Milano',
  ],
  'AC Milan': [
    'Milan', 'Associazione Calcio Milan', 'AC Milano',
  ],
  'Juventus': [
    'Juventus FC', 'Juve',
  ],
  'Napoli': [
    'SSC Napoli', 'S.S.C. Napoli',
  ],
  'AS Roma': [
    'Roma', 'Associazione Sportiva Roma',
  ],
  'Lazio': [
    'SS Lazio', 'S.S. Lazio',
  ],
  'Atalanta': [
    'Atalanta BC', 'Atalanta Bergamo',
  ],
  'Fiorentina': [
    'ACF Fiorentina',
  ],
  'Porto': [
    'FC Porto', 'Porto FC',
  ],
  'Benfica': [
    'SL Benfica', 'Sport Lisboa e Benfica',
  ],
  'Sporting CP': [
    'Sporting Lisbon', 'Sporting Club', 'Sporting', 'SCP',
  ],
  'Ajax': [
    'AFC Ajax', 'Ajax Amsterdam',
  ],
  'PSV Eindhoven': [
    'PSV',
  ],
  'Aston Villa': [
    'Villa', 'AVFC', 'Aston Villa FC',
  ],

  // ════════════════════════════════════════════════════════════════════════════
  // PREMIER LEAGUE (additional teams beyond Champions League roster)
  // ════════════════════════════════════════════════════════════════════════════

  'West Ham United': [
    'West Ham', 'WHUFC', 'West Ham Utd',
  ],
  'Newcastle United': [
    'Newcastle', 'Newcastle Utd', 'Newcastle United FC', 'NUFC',
  ],
  'Brighton & Hove Albion': [
    'Brighton', 'Brighton & Hove', 'BHAFC', 'Brighton Hove Albion',
  ],
  'Leicester City': [
    'Leicester', 'LCFC', 'Leicester City FC',
  ],
  'Crystal Palace': [
    'Palace', 'C. Palace', 'Crystal Palace FC',
  ],
  'Everton': [
    'Everton FC', 'EFC', 'The Toffees',
  ],
  'Wolverhampton Wanderers': [
    'Wolves', 'Wolverhampton', 'WWFC',
  ],
  'Brentford': [
    'Brentford FC', 'The Bees',
  ],
  'Fulham': [
    'Fulham FC',
  ],
  'Nottingham Forest': [
    'Nottm Forest', 'Nottingham Forest FC', 'NFFC', 'Forest',
  ],
  'Bournemouth': [
    'AFC Bournemouth',
  ],
  'Ipswich Town': [
    'Ipswich', 'Ipswich Town FC', 'ITFC',
  ],
  'Southampton': [
    'Southampton FC', 'Saints',
  ],

  // ════════════════════════════════════════════════════════════════════════════
  // UEFA EUROPA LEAGUE / CONFERENCE LEAGUE
  // ════════════════════════════════════════════════════════════════════════════

  'Eintracht Frankfurt': [
    'Frankfurt', 'Eintracht', 'SGE',
  ],
  'Rangers': [
    'Rangers FC', 'Glasgow Rangers',
  ],
  'Celtic': [
    'Celtic FC', 'Glasgow Celtic',
  ],

  // ════════════════════════════════════════════════════════════════════════════
  // LA LIGA (additional teams)
  // ════════════════════════════════════════════════════════════════════════════

  'Betis': [
    'Real Betis', 'Real Betis Balompié', 'Real Betis Balonpie',
  ],
  'Sociedad': [
    'Real Sociedad', 'Real Sociedad FC',
  ],
  'Osasuna': [
    'CA Osasuna', 'Club Atlético Osasuna',
  ],
  'Celta Vigo': [
    'Celta', 'RC Celta', 'Celta de Vigo',
  ],
  'Deportivo Alavés': [
    'Alavés', 'Alaves', 'Deportivo Alaves',
  ],
  'Getafe': [
    'Getafe CF',
  ],
  'Girona': [
    'Girona FC',
  ],
  'Rayo Vallecano': [
    'Rayo', 'Vallecano',
  ],
  'Athletic Club': [
    'Athletic Bilbao', 'Athletic', 'Athletic Club Bilbao',
  ],
  'Valencia': [
    'Valencia CF', 'VCF',
  ],
  'Espanyol': [
    'RCD Espanyol', 'Espanyol Barcelona',
  ],
  'Leganés': [
    'Leganes', 'CD Leganés', 'CD Leganes',
  ],
  'Valladolid': [
    'Real Valladolid', 'Real Valladolid CF',
  ],
  'Mallorca': [
    'RCD Mallorca',
  ],
  'Las Palmas': [
    'UD Las Palmas', 'Gran Canaria',
  ],

  // ════════════════════════════════════════════════════════════════════════════
  // SERIE A (Italy)
  // ════════════════════════════════════════════════════════════════════════════

  'Torino': [
    'Torino FC', 'FC Torino',
  ],
  'Sampdoria': [
    'UC Sampdoria', 'Samp',
  ],
  'Sassuolo': [
    'US Sassuolo',
  ],
  'Genoa': [
    'Genoa CFC', 'Genoa FC',
  ],
  'Bologna': [
    'Bologna FC', 'Bologna FC 1909',
  ],
  'Udinese': [
    'Udinese Calcio',
  ],
  'Cagliari': [
    'Cagliari Calcio',
  ],
  'Hellas Verona': [
    'Verona', 'Hellas Verona FC',
  ],
  'Empoli': [
    'Empoli FC',
  ],
  'Monza': [
    'AC Monza',
  ],
  'Lecce': [
    'US Lecce',
  ],
  'Venezia': [
    'Venezia FC',
  ],
  'Como': [
    'Como 1907', 'FC Como',
  ],
  'Parma': [
    'Parma Calcio', 'Parma FC', 'Parma Calcio 1913',
  ],

  // ════════════════════════════════════════════════════════════════════════════
  // BUNDESLIGA (Germany)
  // ════════════════════════════════════════════════════════════════════════════

  'Borussia Mönchengladbach': [
    'M\'gladbach', 'Mönchengladbach', 'Borussia M\'gladbach', 'Gladbach',
  ],
  'Werder Bremen': [
    'Bremen', 'SV Werder Bremen',
  ],
  'Schalke 04': [
    'Schalke', 'S04', 'FC Schalke 04',
  ],
  'VfB Stuttgart': [
    'Stuttgart',
  ],
  'Hoffenheim': [
    'TSG Hoffenheim', 'TSG 1899 Hoffenheim',
  ],
  'Wolfsburg': [
    'VfL Wolfsburg',
  ],
  'Augsburg': [
    'FC Augsburg',
  ],
  'Mainz 05': [
    'Mainz', 'FSV Mainz 05',
  ],
  'Heidenheim': [
    'FC Heidenheim', '1. FC Heidenheim',
  ],
  'St. Pauli': [
    'FC St. Pauli', 'Sankt Pauli',
  ],
  'Union Berlin': [
    '1. FC Union Berlin', 'FC Union Berlin',
  ],
  'Freiburg': [
    'SC Freiburg',
  ],
  'Hertha Berlin': [
    'Hertha', 'Hertha BSC', 'Hertha BSC Berlin',
  ],

  // ════════════════════════════════════════════════════════════════════════════
  // LIGUE 1 (France)
  // ════════════════════════════════════════════════════════════════════════════

  'Marseille': [
    'Olympique de Marseille', 'OM', 'Olympique Marseille',
  ],
  'Lyon': [
    'Olympique Lyonnais', 'OL', 'Olympique de Lyon',
  ],
  'Monaco': [
    'AS Monaco', 'AS Monaco FC',
  ],
  'Lille': [
    'LOSC', 'LOSC Lille', 'Lille OSC',
  ],
  'Nice': [
    'OGC Nice',
  ],
  'Rennes': [
    'Stade Rennais', 'Stade Rennais FC',
  ],
  'Nantes': [
    'FC Nantes',
  ],
  'Strasbourg': [
    'RC Strasbourg', 'Racing Club de Strasbourg', 'RCSA',
  ],
  'Lens': [
    'RC Lens', 'Racing Club de Lens',
  ],
  'Brest': [
    'Stade Brest', 'Stade Brestois 29',
  ],
  'Toulouse': [
    'Toulouse FC', 'TFC',
  ],
  'Montpellier': [
    'Montpellier HSC', 'MHSC',
  ],
  'Reims': [
    'Stade de Reims',
  ],
  'Lorient': [
    'FC Lorient',
  ],
  'Le Havre': [
    'Le Havre AC', 'HAC',
  ],
  'Auxerre': [
    'AJ Auxerre',
  ],
  'Angers': [
    'Angers SCO', 'SCO Angers',
  ],
  'Saint-Étienne': [
    'Saint-Etienne', 'ASSE', 'AS Saint-Étienne', 'AS Saint-Etienne',
  ],
};
