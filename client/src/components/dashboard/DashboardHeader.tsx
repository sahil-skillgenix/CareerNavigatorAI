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
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        <div className="flex items-center">
          <span className="font-bold text-xl text-primary-dark">Skill<span className="text-secondary-dark">genix</span></span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600 hidden sm:block">
            Welcome, {user?.fullName}
          </div>
          <div className="relative">
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
            </Button>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}