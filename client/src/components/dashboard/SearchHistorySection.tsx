import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";

interface SearchHistoryItem {
  id: string;
  title: string;
  date: string;
}

interface SearchHistorySectionProps {
  searchHistory?: SearchHistoryItem[];
}

export function SearchHistorySection({ searchHistory = [] }: SearchHistorySectionProps) {
  // Default history items if none provided
  const defaultHistory = [
    {
      id: "1",
      title: "Software Developer to CTO Pathway",
      date: "April 10, 2025"
    },
    {
      id: "2",
      title: "Marketing Associate to CMO Pathway",
      date: "April 5, 2025"
    },
    {
      id: "3",
      title: "Data Analyst to Data Science Manager",
      date: "March 28, 2025"
    }
  ];

  const historyItems = searchHistory.length > 0 ? searchHistory : defaultHistory;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <History className="h-5 w-5 mr-2 text-primary" />
          Career Pathway Search History
        </CardTitle>
        <CardDescription>Results from your previous career pathway searches</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {historyItems.map((item) => (
            <div key={item.id} className="p-4 border rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">Searched on {item.date}</p>
                </div>
                <Button variant="outline" size="sm">View</Button>
              </div>
            </div>
          ))}
          
          {historyItems.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No search history found. Try searching for career pathways!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}