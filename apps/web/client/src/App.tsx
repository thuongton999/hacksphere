import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Suspense, lazy } from "react";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Teams from "@/pages/teams";
import Schedule from "@/pages/schedule";
import Submissions from "@/pages/submissions";
import Judging from "@/pages/judging";
import Mentors from "@/pages/mentors";
import Community from "@/pages/community";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import { useAuth } from "@/hooks/useAuth";

// Planets pages - lazy loaded for code splitting
const ParticipantsPage = lazy(() => import("@/planets/pages/ParticipantsPage"));
const InvestorsPage = lazy(() => import("@/planets/pages/InvestorsPage"));
const JudgesPage = lazy(() => import("@/planets/pages/JudgesPage"));
const HomePlanet = lazy(() => import("@/planets/HomePlanet"));
const HomePlanetRedesigned = lazy(() => import("@/planets/HomePlanetRedesigned"));

// Check if Planets feature is enabled
const isPlanetsEnabled = () => {
  return import.meta.env.VITE_HACKSPHERE_PLANETS_ENABLED === 'true' || 
         typeof window !== 'undefined' && 
         (window as any).__PLANETS_ENABLED === true;
};

// Check if Planet Home is enabled 
const isPlanetHomeEnabled = () => {
  return import.meta.env.VITE_HACKSPHERE_PLANET_HOME_ENABLED === 'true' ||
         typeof window !== 'undefined' && 
         (window as any).__PLANET_HOME_ENABLED === true;
};

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={isPlanetHomeEnabled() ? 
            () => (
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
                <HomePlanetRedesigned />
              </Suspense>
            ) : Dashboard
          } />
          <Route path="/teams" component={Teams} />
          <Route path="/schedule" component={Schedule} />
          <Route path="/submissions" component={Submissions} />
          <Route path="/judging" component={Judging} />
          <Route path="/mentors" component={Mentors} />
          <Route path="/community" component={Community} />
          <Route path="/profile" component={Profile} />
          <Route path="/settings" component={Settings} />
          {/* Keep Dashboard accessible when Planet Home is enabled */}
          {isPlanetHomeEnabled() && (
            <Route path="/dashboard" component={Dashboard} />
          )}
          
          {/* Planets routes - only available when feature is enabled */}
          {isPlanetsEnabled() && (
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading Planets...</div>}>
              <Route path="/planets/participants" component={ParticipantsPage} />
              <Route path="/planets/investors" component={InvestorsPage} />
              <Route path="/planets/judges" component={JudgesPage} />
            </Suspense>
          )}
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
