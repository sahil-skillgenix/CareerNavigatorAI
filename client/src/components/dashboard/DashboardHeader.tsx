import Navbar from "@/components/navbar-fixed";

interface DashboardHeaderProps {
  onLogout?: () => void;
}

export function DashboardHeader({ onLogout }: DashboardHeaderProps) {
  return <Navbar />;
}