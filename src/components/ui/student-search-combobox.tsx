import * as React from "react";
import { Check, ChevronsUpDown, Search, User, Phone, Mail, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
  const containerRef = React.useRef<HTMLDivElement>(null);
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

  const handleSelect = (payload: string | StudentSearchResult) => {
    let chosen: StudentSearchResult | null = null;

    if (typeof payload === "string") {
      const idNum = Number.parseInt(payload, 10);
      if (!Number.isNaN(idNum)) {
        chosen =
          results.find((s) => s.id === idNum) ||
          recentSelections.find((s) => s.id === idNum) ||
          null;
      }
    } else {
      chosen = payload;
    }

    onSelect(chosen);
    if (chosen) addToRecentSelections(chosen);
    setOpen(false);
    setSearchTerm("");
  };

  const handleClear = () => {
    onSelect(null);
    setOpen(false);
    setSearchTerm('');
  };

  const StudentItem = ({ student, isRecent = false }: { student: StudentSearchResult; isRecent?: boolean }) => (
    <CommandItem
      key={`${isRecent ? 'recent' : 'search'}-${student.id}`}
      value={String(student.id)}
      onSelect={(val) => handleSelect(val)}
      className="flex flex-col items-start gap-1 p-3 cursor-pointer"
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
    </CommandItem>
  );

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
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Type to search students..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="border-none focus:ring-0"
              autoFocus
            />
            <CommandList className="max-h-[300px]">
              {isLoading && (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span className="ml-2">Searching students...</span>
                </div>
              )}
              
              {!isLoading && searchTerm && results.length === 0 && (
                <CommandEmpty>
                  <div className="flex flex-col items-center gap-2 p-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                    <p>No students found for "{searchTerm}"</p>
                    <p className="text-sm text-muted-foreground">Try searching by ID, name, email, or mobile number</p>
                  </div>
                </CommandEmpty>
              )}

              {!searchTerm && recentSelections.length > 0 && (
                <CommandGroup heading="Recent Selections">
                  {recentSelections.map((student) => (
                    <StudentItem key={`recent-${student.id}`} student={student} isRecent />
                  ))}
                </CommandGroup>
              )}

              {results.length > 0 && (
                <CommandGroup heading={searchTerm ? `Search Results (${results.length})` : "Students"}>
                  {results.map((student) => (
                    <StudentItem key={`search-${student.id}`} student={student} />
                  ))}
                </CommandGroup>
              )}

              {selectedStudent && (
                <CommandGroup>
                  <CommandItem onSelect={handleClear} className="text-destructive">
                    <span>Clear selection</span>
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
