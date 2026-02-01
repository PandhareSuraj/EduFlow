import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showStats?: boolean;
  statsCount?: number;
}

function StatsRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(count)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-28" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function FilterBarSkeleton() {
  return (
    <div className="flex flex-wrap gap-2">
      <Skeleton className="h-10 flex-1 max-w-sm" />
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-10 w-24" />
    </div>
  )
}

function TableContentSkeleton({ rows = 5, columns = 6 }: { rows?: number; columns?: number }) {
  // Vary widths for realism
  const widths = ["w-24", "w-32", "w-20", "w-28", "w-16", "w-20", "w-24", "w-16"]
  
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {[...Array(columns)].map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className={`h-4 ${widths[i % widths.length]}`} />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(rows)].map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {[...Array(columns)].map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton 
                      className={`h-4 ${widths[(colIndex + rowIndex) % widths.length]}`} 
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export function TableSkeleton({ 
  rows = 5, 
  columns = 6, 
  showStats = true, 
  statsCount = 4 
}: TableSkeletonProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats Cards */}
      {showStats && <StatsRowSkeleton count={statsCount} />}

      {/* Filter Bar */}
      <FilterBarSkeleton />

      {/* Table */}
      <TableContentSkeleton rows={rows} columns={columns} />
    </div>
  )
}

export { StatsRowSkeleton, FilterBarSkeleton, TableContentSkeleton }
