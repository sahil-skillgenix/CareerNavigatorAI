import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { SavedResourcesProvider } from "@/hooks/use-saved-resources";
import { ProtectedRoute } from "@/lib/protected-route";

import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import NewDashboardPage from "@/pages/new-dashboard-page";
import CareerPathwayPage from "@/pages/career-pathway-page";
import CareerAnalysisPage from "@/pages/career-analysis-page";
import LearningResourcesPage from "@/pages/learning-resources-page";
import OrganizationPathwayPage from "@/pages/organization-pathway-page";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      <ProtectedRoute path="/new-dashboard" component={NewDashboardPage} />
      <ProtectedRoute path="/career-pathway" component={CareerPathwayPage} />
      <ProtectedRoute path="/career-analysis" component={CareerAnalysisPage} />
      <ProtectedRoute path="/learning-resources" component={LearningResourcesPage} />
      <ProtectedRoute path="/organization-pathway" component={OrganizationPathwayPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SavedResourcesProvider>
          <Router />
          <Toaster />
        </SavedResourcesProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
