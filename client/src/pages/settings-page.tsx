import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { UserCog, Lock, Bell, Shield, History } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AuthenticatedLayout } from "@/components/layouts";

export default function SettingsPage() {
  // Get tab from URL or default to profile
  const [, params] = window.location.pathname.split('/settings/');
  const defaultTab = params || 'profile';
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences.
            </p>
          </div>
          
          <Separator />
          
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8">
              <aside className="lg:col-span-3">
                <div className="sticky top-20">
                  <SettingsTabs />
                </div>
              </aside>
              <div className="lg:col-span-9">
                <TabsContent value="profile">
                  <ProfileSettings />
                </TabsContent>
                <TabsContent value="security">
                  <SecuritySettings />
                </TabsContent>
                <TabsContent value="notifications">
                  <NotificationsSettings />
                </TabsContent>
                <TabsContent value="2fa">
                  <TwoFactorSettings />
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

function SettingsTabs() {
  return (
    <Card className="shadow-sm">
      <TabsList className="flex flex-col w-full space-y-1 p-2 h-auto bg-white">
        <TabsTrigger value="profile" className="justify-start w-full p-3 text-left data-[state=active]:bg-primary/10">
          <UserCog className="h-4 w-4 mr-3" />
          Profile
        </TabsTrigger>
        <TabsTrigger value="security" className="justify-start w-full p-3 text-left data-[state=active]:bg-primary/10">
          <Lock className="h-4 w-4 mr-3" />
          Security
        </TabsTrigger>
        <TabsTrigger value="notifications" className="justify-start w-full p-3 text-left data-[state=active]:bg-primary/10">
          <Bell className="h-4 w-4 mr-3" />
          Notifications
        </TabsTrigger>
        <TabsTrigger value="2fa" className="justify-start w-full p-3 text-left data-[state=active]:bg-primary/10">
          <Shield className="h-4 w-4 mr-3" />
          Email 2FA
        </TabsTrigger>
      </TabsList>
    </Card>
  );
}

function ProfileSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState(user?.email || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || "");
  
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { email: string; phone: string }) => {
      const res = await apiRequest("PATCH", "/api/user/profile", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({ email, phone: phoneNumber });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>
          Update your personal information and contact details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={user?.fullName || ""}
                disabled
                placeholder="Your full name"
              />
              <p className="text-sm text-muted-foreground">
                Contact support to change your name.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Your phone number"
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            disabled={updateProfileMutation.isPending}
          >
            {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function SecuritySettings() {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deactivateConfirmation, setDeactivateConfirmation] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await apiRequest("POST", "/api/user/change-password", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Password changed",
        description: "Your password has been updated successfully.",
      });
      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: Error) => {
      toast({
        title: "Password change failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const deactivateAccountMutation = useMutation({
    mutationFn: async (data: { confirmPhrase: string }) => {
      const res = await apiRequest("POST", "/api/user/deactivate", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Account deactivated",
        description: "Your account has been deactivated. You will be redirected to the home page.",
      });
      // Redirect to home after successful deactivation (after a delay)
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    },
    onError: (error: Error) => {
      toast({
        title: "Deactivation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const deleteAccountMutation = useMutation({
    mutationFn: async (data: { confirmPhrase: string }) => {
      const res = await apiRequest("POST", "/api/user/delete", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted. You will be redirected to the home page.",
      });
      // Redirect to home after successful deletion (after a delay)
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match.",
        variant: "destructive",
      });
      return;
    }
    
    changePasswordMutation.mutate({
      currentPassword,
      newPassword,
    });
  };
  
  const handleDeactivateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (deactivateConfirmation !== "DEACTIVATE") {
      toast({
        title: "Invalid confirmation",
        description: "You must type DEACTIVATE (all caps) to confirm.",
        variant: "destructive",
      });
      return;
    }
    
    deactivateAccountMutation.mutate({
      confirmPhrase: deactivateConfirmation
    });
  };
  
  const handleDeleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (deleteConfirmation !== "DELETE PERMANENTLY") {
      toast({
        title: "Invalid confirmation",
        description: "You must type DELETE PERMANENTLY (all caps) to confirm.",
        variant: "destructive",
      });
      return;
    }
    
    deleteAccountMutation.mutate({
      confirmPhrase: deleteConfirmation
    });
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              disabled={changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Login History</CardTitle>
          <CardDescription>
            Review your recent account activity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <History className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Current session</p>
                  <p className="text-xs text-muted-foreground">Today, {new Date().toLocaleTimeString()}</p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Current IP
              </div>
            </div>
            <Separator />
            {/* We would populate past logins from the API here */}
            <p className="text-sm text-muted-foreground">
              Login history is currently being tracked. Past sessions will appear here.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-amber-200">
        <CardHeader className="bg-amber-50 border-b border-amber-100">
          <CardTitle className="text-amber-700">Deactivate Account</CardTitle>
          <CardDescription className="text-amber-600">
            Temporarily disable your account. You can reactivate it later.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleDeactivateSubmit} className="space-y-6">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                When you deactivate your account:
              </p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>Your profile will be hidden from other users</li>
                <li>You won't be able to log in until you contact support to reactivate</li>
                <li>Your data will be preserved for future reactivation</li>
              </ul>
              
              <div className="space-y-2 pt-2">
                <Label htmlFor="deactivate-confirmation" className="text-amber-700">
                  Type DEACTIVATE to confirm
                </Label>
                <Input
                  id="deactivate-confirmation"
                  className="border-amber-300 focus:ring-amber-500"
                  value={deactivateConfirmation}
                  onChange={(e) => setDeactivateConfirmation(e.target.value)}
                  placeholder="DEACTIVATE"
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              variant="outline"
              className="border-amber-500 text-amber-700 hover:bg-amber-50"
              disabled={deactivateAccountMutation.isPending}
            >
              {deactivateAccountMutation.isPending ? "Processing..." : "Deactivate Account"}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card className="border-red-200">
        <CardHeader className="bg-red-50 border-b border-red-100">
          <CardTitle className="text-red-700">Delete Account Permanently</CardTitle>
          <CardDescription className="text-red-600">
            Permanently delete your account and all associated data. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleDeleteSubmit} className="space-y-6">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                When you delete your account:
              </p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>All your personal data will be permanently deleted</li>
                <li>Your career analyses and saved resources will be removed</li>
                <li>Your progress tracking and badges will be lost</li>
                <li>This action <strong>cannot</strong> be undone</li>
              </ul>
              
              <div className="space-y-2 pt-2">
                <Label htmlFor="delete-confirmation" className="text-red-700">
                  Type DELETE PERMANENTLY to confirm
                </Label>
                <Input
                  id="delete-confirmation"
                  className="border-red-300 focus:ring-red-500"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="DELETE PERMANENTLY"
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              variant="destructive"
              disabled={deleteAccountMutation.isPending}
            >
              {deleteAccountMutation.isPending ? "Processing..." : "Delete Account Permanently"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationsSettings() {
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  
  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: { 
      emailNotifications: boolean; 
      smsNotifications: boolean;
      pushNotifications: boolean;
    }) => {
      const res = await apiRequest("PATCH", "/api/user/notifications", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Notification preferences updated",
        description: "Your notification settings have been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateNotificationsMutation.mutate({
      emailNotifications,
      smsNotifications,
      pushNotifications,
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose how you'd like to receive notifications from Skillgenix.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email.
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sms-notifications">SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via text message.
                </p>
              </div>
              <Switch
                id="sms-notifications"
                checked={smsNotifications}
                onCheckedChange={setSmsNotifications}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications in your browser.
                </p>
              </div>
              <Switch
                id="push-notifications"
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            disabled={updateNotificationsMutation.isPending}
          >
            {updateNotificationsMutation.isPending ? "Saving..." : "Save Preferences"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function TwoFactorSettings() {
  const { toast } = useToast();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  
  const toggleTwoFactorMutation = useMutation({
    mutationFn: async (data: { enabled: boolean; verificationCode?: string }) => {
      const res = await apiRequest("POST", "/api/user/2fa", data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: twoFactorEnabled ? "2FA Disabled" : "2FA Enabled",
        description: twoFactorEnabled 
          ? "Two-factor authentication has been disabled." 
          : "Two-factor authentication has been enabled for your account.",
      });
      setTwoFactorEnabled(!twoFactorEnabled);
      setVerificationCode("");
    },
    onError: (error: Error) => {
      toast({
        title: "Operation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If enabling 2FA, require verification code
    if (!twoFactorEnabled && !verificationCode) {
      toast({
        title: "Verification code required",
        description: "Please enter the verification code sent to your email.",
        variant: "destructive",
      });
      return;
    }
    
    toggleTwoFactorMutation.mutate({
      enabled: !twoFactorEnabled,
      verificationCode: verificationCode || undefined,
    });
  };
  
  const sendVerificationCode = () => {
    toast({
      title: "Verification code sent",
      description: "A verification code has been sent to your email address.",
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Two-Factor Authentication</CardTitle>
        <CardDescription>
          Add an extra layer of security to your account with email-based two-factor authentication.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="2fa-toggle">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  {twoFactorEnabled 
                    ? "Your account is currently protected with 2FA." 
                    : "Enable 2FA to improve your account security."}
                </p>
              </div>
              <Switch
                id="2fa-toggle"
                checked={twoFactorEnabled}
                onCheckedChange={(checked) => {
                  if (checked) {
                    // When enabling, first send a verification code
                    sendVerificationCode();
                  } else {
                    setTwoFactorEnabled(false);
                  }
                }}
              />
            </div>
            
            {!twoFactorEnabled && (
              <div className="space-y-2">
                <Label htmlFor="verification-code">Verification Code</Label>
                <div className="flex space-x-2">
                  <Input
                    id="verification-code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter verification code"
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={sendVerificationCode}
                  >
                    Resend
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Enter the verification code sent to your email to enable 2FA.
                </p>
              </div>
            )}
          </div>
          
          <Button 
            type="submit" 
            disabled={toggleTwoFactorMutation.isPending}
          >
            {toggleTwoFactorMutation.isPending 
              ? "Processing..." 
              : twoFactorEnabled 
                ? "Disable 2FA" 
                : "Enable 2FA"
            }
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}