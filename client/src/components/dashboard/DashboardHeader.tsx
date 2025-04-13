import { Button } from "@/components/ui/button";
import { User, LogOut, Briefcase } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface DashboardHeaderProps {
  onLogout?: () => void;
}

export function DashboardHeader({ onLogout }: DashboardHeaderProps) {
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
    if (onLogout) onLogout();
  };
  
  return (
    <header className="backdrop-blur-md bg-white/70 border-b border-white/50 sticky top-0 z-10 shadow-sm">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-1.5 rounded-full">
            <Briefcase className="h-5 w-5 text-primary" />
          </div>
          <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            CareerPathAI
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600 hidden sm:block backdrop-blur-md bg-white/30 px-3 py-1.5 rounded-full border border-white/50">
            Welcome, {user?.fullName}
          </div>
          <div className="relative">
            <Button variant="outline" size="icon" className="rounded-full backdrop-blur-md bg-white/30 border-white/50">
              <User className="h-5 w-5 text-primary" />
            </Button>
          </div>
          <Button 
            variant="outline"
            size="sm" 
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="backdrop-blur-md bg-white/30 border-white/50 hover:bg-white/50"
          >
            <LogOut className="h-4 w-4 mr-2 text-primary" />
            <span className="hidden sm:inline">{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}