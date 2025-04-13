import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Building, Search, Upload } from "lucide-react";

export function OrganizationSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building className="h-5 w-5 mr-2 text-primary" />
          My Organization
        </CardTitle>
        <CardDescription>Connect with your organization or upload org structure</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex w-full max-w-xl mx-auto">
          <Input placeholder="Search for your organization" className="rounded-r-none" />
          <Button className="rounded-l-none">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
        
        <Separator />
        
        <div className="text-center p-6 border border-dashed rounded-md bg-gray-50">
          <Building className="h-10 w-10 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Upload Organization Structure</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Upload your organization's structure as an Excel file to create customized career pathways
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Browse Files
            </Button>
            <Button variant="outline" className="bg-white">
              Download Template
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}