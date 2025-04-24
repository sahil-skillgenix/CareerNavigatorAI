import { useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { Redirect } from "wouter";
import { AuthenticatedLayout } from "@/components/layouts";
import { UserActivityHistory, UserCareerAnalyses } from "@/components/dashboard";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function HistoryPage() {
  return (
    <ProtectedRoute
      path="/history"
      component={HistoryPageContent}
    />
  );
}

function HistoryPageContent() {
  const { user } = useAuth();
  
  if (!user) {
    return <Redirect to="/auth" />;
  }

  return (
    <AuthenticatedLayout>
      <div className="container py-6 space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Your History</h1>
          <p className="text-muted-foreground">
            View your past activities, analyses, and login history
          </p>
        </div>

        <Tabs defaultValue="activities" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="activities">Activity History</TabsTrigger>
            <TabsTrigger value="analyses">Analysis History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="activities" className="mt-6">
            <UserActivityHistory />
          </TabsContent>
          
          <TabsContent value="analyses" className="mt-6">
            <UserCareerAnalyses showAll={true} />
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
}