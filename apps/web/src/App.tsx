import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { OddsComparison } from './components/OddsComparison';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function ComingSoon({ feature }: { feature: string }) {
  return (
    <div className="flex items-center justify-center h-full min-h-[60vh]">
      <div className="text-center space-y-3">
        <div className="text-4xl">🚀</div>
        <h2 className="text-lg font-semibold text-foreground">{feature}</h2>
        <p className="text-muted-foreground text-sm">Esta función estará disponible próximamente.</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout>
          <Routes>
            {/* Default redirect to odds comparison */}
            <Route path="/" element={<Navigate to="/comparar/futbol/liga-betplay" replace />} />

            {/* ── FREE ── */}
            <Route
              path="/comparar/futbol/liga-betplay"
              element={
                <div className="p-5 max-w-full">
                  <div className="mb-5">
                    <h1 className="text-xl font-bold text-foreground">Liga BetPlay Dimayor</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Comparación de cuotas en tiempo real · Colombia
                    </p>
                  </div>
                  <OddsComparison />
                </div>
              }
            />

            {/* ── PRO (placeholders) ── */}
            <Route path="/mis-apuestas" element={<ComingSoon feature="Mis Apuestas" />} />
            <Route path="/sugerencias-ia" element={<ComingSoon feature="Sugerencias IA" />} />
            <Route path="/rendimiento" element={<ComingSoon feature="Análisis de Rendimiento" />} />

            {/* ── ELITE (placeholders) ── */}
            <Route path="/agente-ia" element={<ComingSoon feature="Agente de Apuestas IA" />} />
            <Route path="/estadisticas" element={<ComingSoon feature="Estadísticas Avanzadas" />} />
            <Route path="/control-financiero" element={<ComingSoon feature="Control Financiero" />} />

            {/* ── Plans ── */}
            <Route path="/planes" element={<ComingSoon feature="Planes y Precios" />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/comparar/futbol/liga-betplay" replace />} />
          </Routes>
        </Layout>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
