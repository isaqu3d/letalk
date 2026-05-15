import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SiteHeader } from "./components/site-header";
import { LeadDetailPage } from "./features/lead-history/pages/lead-detail-page";
import { LeadHistoryPage } from "./features/lead-history/pages/lead-history-page";
import { LeadSearchPage } from "./features/lead-search/pages/lead-search-page";
import { ROUTE_PATTERNS } from "./lib/routes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SiteHeader />
        <Routes>
          <Route path={ROUTE_PATTERNS.home} element={<LeadSearchPage />} />
          <Route path={ROUTE_PATTERNS.history} element={<LeadHistoryPage />} />
          <Route path={ROUTE_PATTERNS.detail} element={<LeadDetailPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
