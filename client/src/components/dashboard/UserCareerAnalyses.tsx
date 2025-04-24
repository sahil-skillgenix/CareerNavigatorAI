import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, AlertCircle, FileText, Clock, ArrowUpRight } from "lucide-react";

interface CareerAnalysis {
  _id: string;
  userId: string;
  title: string;
  input: {
    currentRole: string;
    targetRole: string;
    experience: string;
    education: string;
    skills: string;
    industries: string;
  };
  progress: number;
  createdAt: string;
  updatedAt: string;
}

function UserCareerAnalyses({ showAll = false }: { showAll?: boolean }) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  const { data: analyses, isLoading, error } = useQuery<CareerAnalysis[]>({
    queryKey: ['/api/career-analyses'],
    enabled: !!user,
  });
  
  // Show only the latest analyses unless showAll is true
  const displayedAnalyses = showAll 
    ? analyses 
    : analyses?.slice(0, 3);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{showAll ? 'Analysis History' : 'Recent Analyses'}</CardTitle>
          <CardDescription>
            {showAll 
              ? 'Your complete history of career analyses' 
              : 'Your most recent career analyses and progress'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading analyses...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{showAll ? 'Analysis History' : 'Recent Analyses'}</CardTitle>
          <CardDescription>
            {showAll 
              ? 'Your complete history of career analyses' 
              : 'Your most recent career analyses and progress'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-destructive gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>Failed to load analyses. Please try again later.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analyses || analyses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{showAll ? 'Analysis History' : 'Recent Analyses'}</CardTitle>
          <CardDescription>
            {showAll 
              ? 'Your complete history of career analyses' 
              : 'Your most recent career analyses and progress'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-medium mb-2">No analyses yet</h3>
            <p className="text-muted-foreground mb-4">
              Get personalized career insights by running your first analysis
            </p>
            <Button onClick={() => navigate('/career-pathway')}>
              Start Career Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{showAll ? 'Analysis History' : 'Recent Analyses'}</CardTitle>
          <CardDescription>
            {showAll 
              ? 'Your complete history of career analyses' 
              : 'Your most recent career analyses and progress'}
          </CardDescription>
        </div>
        {!showAll && analyses.length > 3 && (
          <Button variant="ghost" asChild>
            <Link to="/history" className="flex items-center gap-1">
              <span>View all</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Current Role</TableHead>
                <TableHead>Target Role</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedAnalyses?.map((analysis) => (
                <TableRow key={analysis._id}>
                  <TableCell className="font-medium">{analysis.title}</TableCell>
                  <TableCell>{analysis.input.currentRole}</TableCell>
                  <TableCell>{analysis.input.targetRole}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {format(new Date(analysis.createdAt), 'MMM d, yyyy')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="w-full flex items-center gap-2">
                      <Progress value={analysis.progress} className="h-2" />
                      <span className="text-xs w-10">{Math.round(analysis.progress)}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate(`/career-analysis/${analysis._id}`)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default UserCareerAnalyses;