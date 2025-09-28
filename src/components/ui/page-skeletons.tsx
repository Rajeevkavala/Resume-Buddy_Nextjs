import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DashboardSkeleton() {
  return (
    <div className="flex-1 p-4 md:p-8">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="flex gap-2 mt-4 sm:mt-0">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-28" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Resume upload section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <div className="border border-dashed border-gray-300 rounded-lg p-8">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 text-center">
                      <Skeleton className="h-4 w-48 mx-auto" />
                      <Skeleton className="h-3 w-32 mx-auto" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                  </div>
                </div>
              </div>
              
              {/* Extracted text area skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-[300px] w-full" />
              </div>
            </div>
            
            {/* Job description section */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-[400px] w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function AnalysisSkeleton() {
  return (
    <div className="flex-1 p-4 md:p-8">
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Generate button area */}
            <div className="flex justify-center">
              <Skeleton className="h-10 w-48" />
            </div>
            
            {/* Analysis content skeleton */}
            <div className="space-y-4">
              {/* Overall score section */}
              <div className="space-y-3">
                <Skeleton className="h-6 w-32" />
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
              </div>
              
              {/* Sections skeleton */}
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-6 w-40" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  
                  {/* Bullet points */}
                  <div className="space-y-2 ml-4">
                    <Skeleton className="h-3 w-5/6" />
                    <Skeleton className="h-3 w-4/5" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
              
              {/* Recommendations section */}
              <div className="space-y-3">
                <Skeleton className="h-6 w-36" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-5/6" />
                      <Skeleton className="h-3 w-4/5" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-5/6" />
                      <Skeleton className="h-3 w-4/5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function FormSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </CardContent>
    </Card>
  );
}

export function QASkeleton() {
  return (
    <div className="flex-1 p-4 md:p-8">
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Topic selection and generate button */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="space-y-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-10 w-48" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-10 w-24" />
              </div>
              <Skeleton className="h-10 w-36" />
            </div>
            
            {/* Q&A content skeleton */}
            <div className="space-y-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-5 w-3/4" />
                  </div>
                  <div className="space-y-2 ml-7">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function InterviewSkeleton() {
  return (
    <div className="flex-1 p-4 md:p-8">
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Generate button */}
            <div className="flex justify-center">
              <Skeleton className="h-10 w-48" />
            </div>
            
            {/* Interview questions skeleton */}
            <div className="space-y-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-6 w-8 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-4/5" />
                    </div>
                  </div>
                  
                  {/* Category badge */}
                  <div className="ml-11">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  
                  {/* Sample answer */}
                  <div className="ml-11 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-5/6" />
                      <Skeleton className="h-3 w-4/5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ImprovementSkeleton() {
  return (
    <div className="flex-1 p-4 md:p-8">
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Generate button */}
            <div className="flex justify-center">
              <Skeleton className="h-10 w-48" />
            </div>
            
            {/* Improvement sections */}
            <div className="space-y-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-6 w-48" />
                  
                  {/* Priority badges */}
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  
                  {/* Content */}
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                    
                    {/* Bullet points */}
                    <div className="space-y-2 ml-4">
                      <Skeleton className="h-3 w-5/6" />
                      <Skeleton className="h-3 w-4/5" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function TextAreaSkeleton({ height = "h-32" }: { height?: string }) {
  return <Skeleton className={`w-full ${height}`} />;
}

export function ButtonSkeleton({ width = "w-24" }: { width?: string }) {
  return <Skeleton className={`h-10 ${width}`} />;
}