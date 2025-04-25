import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Loader2, PlusCircle, Edit, Trash2, Check, AlertTriangle, BarChart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

// Type definitions
interface FeatureLimit {
  id: string;
  name: string;
  description: string;
  defaultLimit: number;
  defaultFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'per_account';
  active: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

interface FormFeatureLimit {
  name: string;
  description: string;
  defaultLimit: number;
  defaultFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'per_account';
  active: boolean;
}

export default function FeatureLimits() {
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedLimit, setSelectedLimit] = useState<FeatureLimit | null>(null);
  const [formValues, setFormValues] = useState<FormFeatureLimit>({
    name: '',
    description: '',
    defaultLimit: 10,
    defaultFrequency: 'monthly',
    active: true,
  });

  // Fetch feature limits
  const { data: featureLimits, isLoading, error } = useQuery({
    queryKey: ['/api/admin/feature-limits'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/feature-limits');
      const data = await response.json();
      return data;
    }
  });

  // Create feature limit mutation
  const createFeatureLimitMutation = useMutation({
    mutationFn: async (featureLimit: FormFeatureLimit) => {
      const response = await apiRequest('POST', '/api/admin/feature-limits', { featureLimits: [featureLimit] });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/feature-limits'] });
      toast({
        title: 'Feature limit created',
        description: 'The feature limit has been created successfully',
        variant: 'default'
      });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: 'Failed to create feature limit',
        description: error.message || 'There was an error creating the feature limit',
        variant: 'destructive'
      });
    }
  });

  // Update feature limit mutation
  const updateFeatureLimitMutation = useMutation({
    mutationFn: async (featureLimit: FormFeatureLimit & { id: string }) => {
      const { id, ...limit } = featureLimit;
      const response = await apiRequest('PATCH', `/api/admin/feature-limits/${id}`, limit);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/feature-limits'] });
      toast({
        title: 'Feature limit updated',
        description: 'The feature limit has been updated successfully',
        variant: 'default'
      });
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Failed to update feature limit',
        description: error.message || 'There was an error updating the feature limit',
        variant: 'destructive'
      });
    }
  });

  // Initialize default limits mutation
  const initializeDefaultLimitsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/admin/feature-limits/initialize');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/feature-limits'] });
      toast({
        title: 'Default limits initialized',
        description: 'The default feature limits have been initialized successfully',
        variant: 'default'
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to initialize default limits',
        description: error.message || 'There was an error initializing the default limits',
        variant: 'destructive'
      });
    }
  });

  // Reset form values
  const resetForm = () => {
    setFormValues({
      name: '',
      description: '',
      defaultLimit: 10,
      defaultFrequency: 'monthly',
      active: true,
    });
  };

  // Open edit dialog
  const handleEditDialogOpen = (limit: FeatureLimit) => {
    setSelectedLimit(limit);
    setFormValues({
      name: limit.name,
      description: limit.description,
      defaultLimit: limit.defaultLimit,
      defaultFrequency: limit.defaultFrequency,
      active: limit.active,
    });
    setIsEditDialogOpen(true);
  };

  // Open create dialog
  const handleCreateDialogOpen = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    setFormValues((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  // Handle form select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form switch changes
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormValues((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Handle save for edit
  const handleSaveEdit = () => {
    if (selectedLimit) {
      updateFeatureLimitMutation.mutate({
        id: selectedLimit.id,
        ...formValues,
      });
    }
  };

  // Handle save for create
  const handleSaveCreate = () => {
    createFeatureLimitMutation.mutate(formValues);
  };

  // Handle initialize default limits
  const handleInitializeDefaultLimits = () => {
    initializeDefaultLimitsMutation.mutate();
  };

  // Format frequency text
  const formatFrequency = (frequency: string) => {
    switch (frequency) {
      case 'per_account':
        return 'Per Account';
      default:
        return frequency.charAt(0).toUpperCase() + frequency.slice(1);
    }
  };

  // Render statistic cards
  const renderStatCards = () => {
    if (!featureLimits || featureLimits.length === 0) return null;

    const totalLimits = featureLimits.length;
    const activeLimits = featureLimits.filter((limit: FeatureLimit) => limit.active).length;
    const avgLimit = Math.round(featureLimits.reduce((sum: number, limit: FeatureLimit) => sum + limit.defaultLimit, 0) / totalLimits);

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium text-blue-700">Total Limits</CardTitle>
            <CardDescription className="text-blue-600">Feature limit configurations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{totalLimits}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium text-green-700">Active Limits</CardTitle>
            <CardDescription className="text-green-600">Currently enforced limits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{activeLimits}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium text-violet-700">Average Limit</CardTitle>
            <CardDescription className="text-violet-600">Average usage limit</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-700">{avgLimit}</div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (error) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Feature Limits</CardTitle>
          <CardDescription>There was a problem fetching the feature limits data.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>{(error as Error).message || 'Unknown error occurred'}</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/feature-limits'] })}>
            Retry
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Feature Limits</h1>
          <p className="text-gray-500 mt-1">
            Configure usage limits for platform features
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex gap-2 items-center"
            onClick={handleInitializeDefaultLimits}
            disabled={initializeDefaultLimitsMutation.isPending}
          >
            {initializeDefaultLimitsMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <BarChart className="h-4 w-4" />
            )}
            Initialize Default Limits
          </Button>
          <Button 
            className="flex gap-2 items-center bg-primary/90 hover:bg-primary"
            onClick={handleCreateDialogOpen}
          >
            <PlusCircle className="h-4 w-4" />
            Add New Limit
          </Button>
        </div>
      </div>

      {renderStatCards()}

      <Card className="border">
        <CardHeader className="bg-slate-50 rounded-t-lg">
          <CardTitle className="text-lg">Feature Limit Settings</CardTitle>
          <CardDescription>
            Control how many times users can access specific features
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (!featureLimits || featureLimits.length === 0) ? (
            <div className="py-12 text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-amber-500" />
              </div>
              <h3 className="text-lg font-medium">No Feature Limits Found</h3>
              <p className="text-gray-500 mt-2 mb-6">
                No feature limits have been configured yet. Initialize default limits or add a new one.
              </p>
              <Button
                onClick={handleInitializeDefaultLimits}
                disabled={initializeDefaultLimitsMutation.isPending}
                className="mx-auto"
              >
                {initializeDefaultLimitsMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Initializing...
                  </>
                ) : 'Initialize Default Limits'}
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[450px]">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-slate-50">
                    <TableHead className="w-[240px]">Feature</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Limit</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {featureLimits.map((limit: FeatureLimit) => (
                    <TableRow key={limit.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium">{limit.name}</TableCell>
                      <TableCell>{limit.description}</TableCell>
                      <TableCell>{limit.defaultLimit}</TableCell>
                      <TableCell>{formatFrequency(limit.defaultFrequency)}</TableCell>
                      <TableCell>
                        {limit.active ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditDialogOpen(limit)}
                          className="h-8 w-8 p-0 mr-2"
                        >
                          <span className="sr-only">Edit</span>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Feature Limit</DialogTitle>
            <DialogDescription>
              Update the settings for this feature limit
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label 
                htmlFor="name" 
                className="text-right col-span-1"
              >
                Feature Name
              </Label>
              <Input
                id="name"
                name="name"
                className="col-span-3"
                value={formValues.name}
                onChange={handleInputChange}
                disabled={true}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label 
                htmlFor="description" 
                className="text-right col-span-1"
              >
                Description
              </Label>
              <Input
                id="description"
                name="description"
                className="col-span-3"
                value={formValues.description}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label 
                htmlFor="defaultLimit" 
                className="text-right col-span-1"
              >
                Limit
              </Label>
              <Input
                id="defaultLimit"
                name="defaultLimit"
                type="number"
                min={1}
                className="col-span-3"
                value={formValues.defaultLimit}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label 
                htmlFor="defaultFrequency" 
                className="text-right col-span-1"
              >
                Frequency
              </Label>
              <Select
                value={formValues.defaultFrequency}
                onValueChange={(value) => handleSelectChange('defaultFrequency', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="per_account">Per Account</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label 
                htmlFor="active" 
                className="text-right col-span-1"
              >
                Status
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="active"
                  checked={formValues.active}
                  onCheckedChange={(checked) => handleSwitchChange('active', checked)}
                />
                <Label htmlFor="active" className="cursor-pointer">
                  {formValues.active ? 'Active' : 'Inactive'}
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit}
              disabled={updateFeatureLimitMutation.isPending}
            >
              {updateFeatureLimitMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Feature Limit</DialogTitle>
            <DialogDescription>
              Add a new feature limit to the platform
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label 
                htmlFor="new-name" 
                className="text-right col-span-1"
              >
                Feature Name
              </Label>
              <Input
                id="new-name"
                name="name"
                className="col-span-3"
                value={formValues.name}
                onChange={handleInputChange}
                placeholder="e.g., careerAnalysis"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label 
                htmlFor="new-description" 
                className="text-right col-span-1"
              >
                Description
              </Label>
              <Input
                id="new-description"
                name="description"
                className="col-span-3"
                value={formValues.description}
                onChange={handleInputChange}
                placeholder="e.g., Maximum career analyses per month"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label 
                htmlFor="new-defaultLimit" 
                className="text-right col-span-1"
              >
                Limit
              </Label>
              <Input
                id="new-defaultLimit"
                name="defaultLimit"
                type="number"
                min={1}
                className="col-span-3"
                value={formValues.defaultLimit}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label 
                htmlFor="new-defaultFrequency" 
                className="text-right col-span-1"
              >
                Frequency
              </Label>
              <Select
                value={formValues.defaultFrequency}
                onValueChange={(value) => handleSelectChange('defaultFrequency', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="per_account">Per Account</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label 
                htmlFor="new-active" 
                className="text-right col-span-1"
              >
                Status
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="new-active"
                  checked={formValues.active}
                  onCheckedChange={(checked) => handleSwitchChange('active', checked)}
                />
                <Label htmlFor="new-active" className="cursor-pointer">
                  {formValues.active ? 'Active' : 'Inactive'}
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveCreate}
              disabled={createFeatureLimitMutation.isPending}
            >
              {createFeatureLimitMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : 'Create Limit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}