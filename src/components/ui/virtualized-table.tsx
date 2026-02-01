import * as React from "react";
import { useRef, useState, useCallback, useMemo } from "react";
import {
  Table,
  TableBody,
  TableHeader,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface VirtualizedTableProps<T> {
  data: T[];
  rowHeight?: number;
  visibleRows?: number;
  renderRow: (item: T, index: number) => React.ReactNode;
  renderHeader: () => React.ReactNode;
  className?: string;
  emptyMessage?: string;
}

/**
 * Virtualized table component for large datasets
 * Only renders visible rows + buffer for smooth scrolling
 */
export function VirtualizedTable<T>({ 
  data, 
  rowHeight = 52, 
  visibleRows = 15,
  renderRow,
  renderHeader,
  className,
  emptyMessage = "No data available"
}: VirtualizedTableProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  
  const buffer = 3; // Extra rows to render above/below viewport
  
  const { totalHeight, startIndex, endIndex, visibleData, offsetY } = useMemo(() => {
    const totalHeight = data.length * rowHeight;
    const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - buffer);
    const endIndex = Math.min(startIndex + visibleRows + buffer * 2, data.length);
    const visibleData = data.slice(startIndex, endIndex);
    const offsetY = startIndex * rowHeight;
    
    return { totalHeight, startIndex, endIndex, visibleData, offsetY };
  }, [data, scrollTop, rowHeight, visibleRows, buffer]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  if (data.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  // For small datasets, render normally without virtualization
  if (data.length <= visibleRows) {
    return (
      <Table className={className}>
        <TableHeader>
          {renderHeader()}
        </TableHeader>
        <TableBody>
          {data.map((item, idx) => renderRow(item, idx))}
        </TableBody>
      </Table>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={cn("overflow-auto border rounded-md", className)}
      style={{ height: visibleRows * rowHeight + 48 }} // +48 for header
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight + 48, position: 'relative' }}>
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background">
            {renderHeader()}
          </TableHeader>
          <TableBody>
            {/* Spacer for proper scrollbar */}
            <tr style={{ height: offsetY }} aria-hidden="true">
              <td colSpan={100} />
            </tr>
            {visibleData.map((item, idx) => renderRow(item, startIndex + idx))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/**
 * Hook for managing virtualized list state externally
 */
export function useVirtualization<T>(data: T[], rowHeight: number = 52, visibleRows: number = 15) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const virtualState = useMemo(() => {
    const buffer = 3;
    const totalHeight = data.length * rowHeight;
    const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - buffer);
    const endIndex = Math.min(startIndex + visibleRows + buffer * 2, data.length);
    const visibleData = data.slice(startIndex, endIndex);
    const offsetY = startIndex * rowHeight;
    
    return { totalHeight, startIndex, endIndex, visibleData, offsetY };
  }, [data, scrollTop, rowHeight, visibleRows]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return { ...virtualState, handleScroll, scrollTop };
}
