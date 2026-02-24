import * as React from "react";
import { Check, ChevronsUpDown, Search, User, Phone, Mail, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useStudentSearch, StudentSearchResult } from "@/hooks/useStudentSearch";

interface StudentSearchComboboxProps {
  value?: number;
  onSelect: (student: StudentSearchResult | null) => void;
  placeholder?: string;
  className?: string;
}

export function StudentSearchCombobox({
  value,
  onSelect,
  placeholder = "Search student by ID, name, email or mobile...",
  className
}: StudentSearchComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [highlightIndex, setHighlightIndex] = React.useState(-1);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const {
    searchTerm,
    setSearchTerm,
    results,
    isLoading,
    recentSelections,
    addToRecentSelections,
  } = useStudentSearch();

  const selectedStudent = React.useMemo(() => {
    if (!value) return null;
    return results.find(student => student.id === value) ||
           recentSelections.find(student => student.id === value) ||
           null;
  }, [value, results, recentSelections]);

  // Build flat list of selectable items for keyboard nav
  const flatItems = React.useMemo(() => {
    const items: StudentSearchResult[] = [];
    if (!searchTerm && recentSelections.length > 0) {
      items.push(...recentSelections);
    }
    if (results.length > 0) {
      items.push(...results);
    }
    return items;
  }, [searchTerm, recentSelections, results]);

  // Click-outside to close
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Focus input when opened
  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  // Reset highlight when results change
  React.useEffect(() => {
    setHighlightIndex(-1);
  }, [results, searchTerm]);

  const handleSelectStudent = (student: StudentSearchResult) => {
    onSelect(student);
    addToRecentSelections(student);
    setOpen(false);
    setSearchTerm("");
  };

  const handleClear = () => {
    onSelect(null);
    setOpen(false);
    setSearchTerm("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex(prev => Math.min(prev + 1, flatItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && highlightIndex >= 0 && highlightIndex < flatItems.length) {
      e.preventDefault();
      handleSelectStudent(flatItems[highlightIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const StudentItem = ({ student, isRecent = false, isHighlighted = false }: { student: StudentSearchResult; isRecent?: boolean; isHighlighted?: boolean }) => (
    <div
      role="option"
      aria-selected={value === student.id}
      onClick={() => handleSelectStudent(student)}
      className={cn(
        "flex flex-col items-start gap-1 p-3 cursor-pointer rounded-sm text-sm",
        isHighlighted ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            [{student.student_id}] {student.name}
          </span>
          {isRecent && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              Recent
            </span>
          )}
        </div>
        <Check
          className={cn(
            "h-4 w-4",
            value === student.id ? "opacity-100" : "opacity-0"
          )}
        />
      </div>
      <div className="flex items-center gap-4 text-sm text-muted-foreground ml-6">
        <div className="flex items-center gap-1">
          <GraduationCap className="h-3 w-3" />
          <span>{student.course_name}</span>
        </div>
        <div className="flex items-center gap-1">
          <Phone className="h-3 w-3" />
          <span>{student.mobile_number}</span>
        </div>
        <div className="flex items-center gap-1">
          <Mail className="h-3 w-3" />
          <span className="truncate max-w-[150px]">{student.email}</span>
        </div>
      </div>
    </div>
  );

  let itemIndex = 0;

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        type="button"
        onClick={() => setOpen(!open)}
        className={cn("w-full justify-between", className)}
      >
        {selectedStudent ? (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>[{selectedStudent.student_id}] {selectedStudent.name}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Search className="h-4 w-4" />
            <span>{placeholder}</span>
          </div>
        )}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-full z-[60] rounded-md border bg-popover text-popover-foreground shadow-md">
          {/* Search input */}
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Type to search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Results list */}
          <div className="max-h-[300px] overflow-y-auto p-1" role="listbox">
            {isLoading && (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-2 text-sm">Searching students...</span>
              </div>
            )}

            {!isLoading && searchTerm && results.length === 0 && (
              <div className="flex flex-col items-center gap-2 p-4 text-sm">
                <Search className="h-8 w-8 text-muted-foreground" />
                <p>No students found for "{searchTerm}"</p>
                <p className="text-muted-foreground">Try searching by ID, name, email, or mobile number</p>
              </div>
            )}

            {!searchTerm && recentSelections.length > 0 && (
              <div>
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Recent Selections</div>
                {recentSelections.map((student) => {
                  const idx = itemIndex++;
                  return (
                    <StudentItem key={`recent-${student.id}`} student={student} isRecent isHighlighted={highlightIndex === idx} />
                  );
                })}
              </div>
            )}

            {results.length > 0 && (
              <div>
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  {searchTerm ? `Search Results (${results.length})` : "Students"}
                </div>
                {results.map((student) => {
                  const idx = itemIndex++;
                  return (
                    <StudentItem key={`search-${student.id}`} student={student} isHighlighted={highlightIndex === idx} />
                  );
                })}
              </div>
            )}

            {selectedStudent && (
              <div
                onClick={handleClear}
                className="p-3 cursor-pointer text-sm text-destructive hover:bg-accent rounded-sm"
              >
                Clear selection
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
