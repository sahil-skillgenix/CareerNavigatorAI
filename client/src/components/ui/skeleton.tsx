import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

function SkeletonCard({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Card className={cn("overflow-hidden", className)} {...props}>
      <CardContent className="p-0">
        <div className="p-6">
          <Skeleton className="h-5 w-2/5 mb-4" />
          <Skeleton className="h-4 w-4/5 mb-2" />
          <Skeleton className="h-4 w-3/5 mb-2" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <div className="px-6 py-4 bg-muted/20">
          <div className="flex justify-between">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export { Skeleton, SkeletonCard }
