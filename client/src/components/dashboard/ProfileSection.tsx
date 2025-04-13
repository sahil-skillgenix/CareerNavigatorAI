import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User, Calendar, Clock, MapPin } from "lucide-react";
import { useState } from "react";

interface ProfileSectionProps {
  userData: {
    fullName?: string;
    email?: string;
  } | null;
  onSave: () => void;
}

export function ProfileSection({ userData, onSave }: ProfileSectionProps) {
  const [fullName, setFullName] = useState(userData?.fullName || "");
  const [email, setEmail] = useState(userData?.email || "");
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="h-5 w-5 mr-2 text-primary" />
          Basic Details
        </CardTitle>
        <CardDescription>Your personal information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="fullName">Full Name</Label>
            <Input 
              id="fullName" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" type="tel" placeholder="Enter your phone number" />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="dob">Date of Birth</Label>
            <div className="flex gap-2">
              <Input id="dob" type="date" placeholder="DD/MM/YYYY" />
              <Button variant="outline" size="icon">
                <Calendar className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="timezone">Time Zone</Label>
            <div className="flex gap-2">
              <Input id="timezone" defaultValue="UTC+0" />
              <Button variant="outline" size="icon">
                <Clock className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="country">Country</Label>
            <Input id="country" placeholder="Enter your country" />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="state">State/Province</Label>
            <Input id="state" placeholder="Enter your state or province" />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="city">City</Label>
            <div className="flex gap-2">
              <Input id="city" placeholder="Enter your city" />
              <Button variant="outline" size="icon">
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={onSave}>Save Changes</Button>
      </CardFooter>
    </Card>
  );
}