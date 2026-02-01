import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function StatsCardSkeleton() {
  return (
    <Card className="bg-gradient-card shadow-card">
      <CardContent className="p-3 sm:p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full ml-2 flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  )
}

function WelcomeBannerSkeleton() {
  return (
    <div className="bg-gradient-header rounded-lg p-4 sm:p-6 shadow-header">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-8 w-64 bg-white/20" />
          <Skeleton className="h-4 w-96 bg-white/20" />
        </div>
        <Skeleton className="h-10 w-10 rounded-md bg-white/20" />
      </div>
    </div>
  )
}

function QuickActionsCardSkeleton() {
  return (
    <Card className="shadow-card">
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </CardContent>
    </Card>
  )
}

function RecentActivitySkeleton() {
  return (
    <Card className="shadow-card">
      <CardHeader>
        <Skeleton className="h-6 w-36" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Welcome Header Skeleton */}
      <WelcomeBannerSkeleton />

      {/* Stats Grid Skeleton */}
      <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Quick Actions & Activity */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
        <QuickActionsCardSkeleton />
        <div className="lg:col-span-2">
          <RecentActivitySkeleton />
        </div>
      </div>
    </div>
  )
}

export { StatsCardSkeleton, WelcomeBannerSkeleton, QuickActionsCardSkeleton, RecentActivitySkeleton }
