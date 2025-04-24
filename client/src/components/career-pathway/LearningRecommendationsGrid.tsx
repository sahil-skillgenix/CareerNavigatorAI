import React from 'react';
import { CareerAnalysisResult } from './CareerPathwayForm';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, GraduationCap, Layout, Monitor, Book, Bookmark, Calendar } from 'lucide-react';

interface LearningRecommendationsGridProps {
  results: CareerAnalysisResult;
}

export function LearningRecommendationsGrid({ results }: LearningRecommendationsGridProps) {
  // Helper function to render platform-specific courses
  const renderPlatformCourses = (
    courses: Array<{ title: string; url: string; level?: string; duration?: string; instructorName?: string; 
      rating?: string; studentsCount?: string; author?: string; partner?: string; certificationType?: string }>
  ) => {
    if (!courses || courses.length === 0) {
      return (
        <div className="p-4 text-sm text-muted-foreground text-center">
          No specific courses available for this platform.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.slice(0, 4).map((course, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{course.title}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                {course.level && (
                  <Badge variant="outline" className="text-xs px-2 py-0 h-auto">
                    {course.level}
                  </Badge>
                )}
                {course.duration && (
                  <span className="text-xs flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {course.duration}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs pb-2">
              {course.partner && <p>Partner: {course.partner}</p>}
              {course.instructorName && <p>Instructor: {course.instructorName}</p>}
              {course.author && <p>Author: {course.author}</p>}
              {course.rating && <p>Rating: {course.rating}</p>}
              {course.studentsCount && <p>Students: {course.studentsCount}</p>}
              {course.certificationType && <p>Certification: {course.certificationType}</p>}
            </CardContent>
            <CardFooter className="pt-0">
              <a 
                href={course.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-primary flex items-center hover:underline"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View Course
              </a>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  // Certification Rendering
  const renderCertifications = (certifications: string[], title: string, icon: React.ReactNode) => {
    if (!certifications || certifications.length === 0) {
      return null;
    }

    return (
      <div className="mb-6 last:mb-0">
        <h4 className="text-sm font-medium mb-3 flex items-center">
          {icon}
          <span className="ml-2">{title}</span>
        </h4>
        <div className="space-y-2">
          {certifications.map((cert, index) => (
            <div 
              key={index} 
              className="p-3 bg-muted/30 border border-muted rounded-md text-sm text-muted-foreground"
            >
              {cert}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center">
        <GraduationCap className="h-5 w-5 mr-2 text-primary" />
        <h3 className="text-xl font-semibold">Learning Recommendations</h3>
      </div>

      <div className="space-y-6">
        {/* Certification Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recommended Certifications</CardTitle>
            <CardDescription>
              Relevant certifications to enhance your qualifications for your career path
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {renderCertifications(
                results.developmentPlan.recommendedCertifications.university,
                "University Programs",
                <GraduationCap className="h-4 w-4 text-blue-600" />
              )}
              
              {renderCertifications(
                results.developmentPlan.recommendedCertifications.vocational,
                "Vocational Programs",
                <Layout className="h-4 w-4 text-green-600" />
              )}
              
              {renderCertifications(
                results.developmentPlan.recommendedCertifications.online,
                "Online Certifications",
                <Monitor className="h-4 w-4 text-purple-600" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Platform-Specific Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Platform-Specific Courses</CardTitle>
            <CardDescription>
              Curated courses from top e-learning platforms to build your skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="linkedin" className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="linkedin">LinkedIn Learning</TabsTrigger>
                <TabsTrigger value="udemy">Udemy</TabsTrigger>
                <TabsTrigger value="coursera">Coursera</TabsTrigger>
                <TabsTrigger value="microsoft">Microsoft</TabsTrigger>
              </TabsList>
              
              <TabsContent value="linkedin">
                {renderPlatformCourses(results.developmentPlan.platformSpecificCourses?.linkedinLearning || [])}
              </TabsContent>
              
              <TabsContent value="udemy">
                {renderPlatformCourses(results.developmentPlan.platformSpecificCourses?.udemy || [])}
              </TabsContent>
              
              <TabsContent value="coursera">
                {renderPlatformCourses(results.developmentPlan.platformSpecificCourses?.coursera || [])}
              </TabsContent>
              
              <TabsContent value="microsoft">
                {renderPlatformCourses(results.developmentPlan.platformSpecificCourses?.microsoft || [])}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Micro-Learning Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Micro-Learning Tips</CardTitle>
            <CardDescription>
              Quick learning activities you can fit into your busy schedule
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {results.developmentPlan.microLearningTips && 
                results.developmentPlan.microLearningTips.map((tip, index) => (
                <Card key={index} className="border border-muted">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-sm font-medium">{tip.skillArea}</CardTitle>
                      <Badge variant={
                        tip.impactLevel === "high" ? "default" : 
                        tip.impactLevel === "medium" ? "secondary" : 
                        "outline"
                      }>
                        {tip.impactLevel}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">
                      ~{tip.estimatedTimeMinutes} minutes
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm">{tip.tip}</p>
                  </CardContent>
                  {tip.source && (
                    <CardFooter className="pt-0 text-xs text-muted-foreground">
                      Source: {tip.source}
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}