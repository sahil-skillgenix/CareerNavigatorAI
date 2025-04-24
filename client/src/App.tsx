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
import MyDetailsPage from "@/pages/my-details-page";
import DashboardPage from "@/pages/dashboard-page";
import CareerPathwayPage from "@/pages/career-pathway-page";
import CareerAnalysisPage from "@/pages/career-analysis-page";
import LearningResourcesPage from "@/pages/learning-resources-page";
import SavedResourcesPage from "@/pages/saved-resources-page";
import OrganizationPathwayPage from "@/pages/organization-pathway-page";
import SkillDetailPage from "@/pages/skill-detail-page";
import SkillsPage from "@/pages/skills-page";
import RolesPage from "@/pages/roles-page";
import RoleDetailPage from "@/pages/role-detail-page";
import IndustriesPage from "@/pages/industries-page";
import IndustryDetailPage from "@/pages/industry-detail-page";
import SearchPage from "@/pages/search-page";
import SettingsPage from "@/pages/settings-page";

function Router() {
  return (
    <Switch>
      {/* Auth routes */}
      <Route path="/auth" component={AuthPage} />
      
      {/* Protected routes */}
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      <ProtectedRoute path="/my-details" component={MyDetailsPage} />
      <ProtectedRoute path="/career-pathway" component={CareerPathwayPage} />
      <ProtectedRoute path="/career-analysis/:id" component={CareerAnalysisPage} />
      <ProtectedRoute path="/learning-resources" component={LearningResourcesPage} />
      <ProtectedRoute path="/saved-resources" component={SavedResourcesPage} />
      <ProtectedRoute path="/organization-pathway" component={OrganizationPathwayPage} />
      
      {/* Settings routes */}
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/settings/profile" component={SettingsPage} />
      <ProtectedRoute path="/settings/security" component={SettingsPage} />
      <ProtectedRoute path="/settings/notifications" component={SettingsPage} />
      <ProtectedRoute path="/settings/2fa" component={SettingsPage} />
      
      {/* Search page */}
      <Route path="/search" component={SearchPage} />
      
      {/* Skills routes */}
      <Route path="/skills" component={SkillsPage} />
      <Route path="/skills/:id/profile" component={SkillDetailPage} />
      <Route path="/skills/:id/learning-path" component={SkillDetailPage} />
      <Route path="/skills/:id" component={SkillDetailPage} />
      
      {/* Roles routes */}
      <Route path="/roles" component={RolesPage} />
      <Route path="/roles/:id/profile" component={RoleDetailPage} />
      <Route path="/roles/:id" component={RoleDetailPage} />
      
      {/* Industries routes */}
      <Route path="/industries" component={IndustriesPage} />
      <Route path="/industries/:id/profile" component={IndustryDetailPage} />
      <Route path="/industries/:id" component={IndustryDetailPage} />
      
      {/* Home route - should be last before the NotFound route */}
      <Route path="/" component={Home} />
      
      {/* Not found route */}
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
