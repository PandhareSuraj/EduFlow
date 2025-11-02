import { useState, useMemo, useEffect } from 'react';
import { Check, Search, User, GraduationCap, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { LibraryMember } from '@/hooks/useLibraryData';

interface MemberSearchComboboxProps {
  members: LibraryMember[];
  value: string;
  onSelect: (memberId: string) => void;
  onCreateMembers?: () => void;
  isCreatingMembers?: boolean;
  placeholder?: string;
  className?: string;
}

const RECENT_MEMBERS_KEY = 'library_recent_members';
const MAX_RECENT = 5;

export function MemberSearchCombobox({
  members,
  value,
  onSelect,
  onCreateMembers,
  isCreatingMembers,
  placeholder = "Search members...",
  className
}: MemberSearchComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [recentMemberIds, setRecentMemberIds] = useState<string[]>([]);

  // Load recent members from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_MEMBERS_KEY);
      if (stored) {
        setRecentMemberIds(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load recent members:', error);
    }
  }, []);

  const selectedMember = useMemo(
    () => members.find((member) => member.id === value),
    [members, value]
  );

  const filteredMembers = useMemo(() => {
    if (!searchValue) return members;
    
    const search = searchValue.toLowerCase();
    return members.filter(member => 
      member.member_name.toLowerCase().includes(search) ||
      member.membership_number.toLowerCase().includes(search) ||
      member.member_email?.toLowerCase().includes(search) ||
      member.member_type.toLowerCase().includes(search) ||
      member.department?.toLowerCase().includes(search)
    );
  }, [members, searchValue]);

  const recentMembers = useMemo(() => {
    return recentMemberIds
      .map(id => members.find(m => m.id === id))
      .filter((m): m is LibraryMember => m !== undefined)
      .slice(0, MAX_RECENT);
  }, [recentMemberIds, members]);

  const handleSelect = (memberId: string) => {
    onSelect(memberId);
    setOpen(false);
    setSearchValue("");

    // Update recent members
    try {
      const updated = [
        memberId,
        ...recentMemberIds.filter(id => id !== memberId)
      ].slice(0, MAX_RECENT);
      
      setRecentMemberIds(updated);
      localStorage.setItem(RECENT_MEMBERS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save recent members:', error);
    }
  };

  const handleClear = () => {
    onSelect("");
    setSearchValue("");
  };

  const MemberItem = ({ member }: { member: LibraryMember }) => (
    <CommandItem
      key={member.id}
      value={member.id}
      onSelect={() => handleSelect(member.id)}
      className="flex items-start gap-3 p-3 cursor-pointer"
    >
      <Check
        className={cn(
          "h-4 w-4 shrink-0 mt-1",
          value === member.id ? "opacity-100" : "opacity-0"
        )}
      />
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="font-medium">{member.member_name}</div>
          <Badge variant="secondary" className="text-xs">
            {member.member_type === 'student' ? (
              <><GraduationCap className="h-3 w-3 mr-1" />Student</>
            ) : (
              <><User className="h-3 w-3 mr-1" />Faculty</>
            )}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          {member.membership_number}
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {member.member_email && (
            <span className="flex items-center gap-1">
              📧 {member.member_email}
            </span>
          )}
          {member.phone && (
            <span className="flex items-center gap-1">
              📱 {member.phone}
            </span>
          )}
          {member.department && (
            <span className="px-2 py-0.5 rounded-md bg-muted">
              {member.department}
            </span>
          )}
        </div>
      </div>
    </CommandItem>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <div className="flex items-center gap-2 truncate">
            <User className="h-4 w-4 shrink-0 opacity-50" />
            {selectedMember ? (
              <span className="truncate">
                {selectedMember.member_name} - {selectedMember.membership_number}
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {selectedMember && (
              <X
                className="h-4 w-4 opacity-50 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
              />
            )}
            <Search className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[600px] p-0" align="start" sideOffset={8}>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search by name, ID, email, or type..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>
              <div className="py-6 text-center text-sm">
                <User className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                {members.length === 0 ? (
                  <>
                    <p className="font-medium">No library members found</p>
                    {onCreateMembers && (
                      <Button 
                        size="sm" 
                        onClick={onCreateMembers}
                        disabled={isCreatingMembers}
                        className="mt-3"
                      >
                        {isCreatingMembers ? 'Creating...' : 'Create Members from Students/Faculty'}
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <p className="font-medium">No members found</p>
                    <p className="text-muted-foreground mt-1">
                      Try searching with different keywords
                    </p>
                  </>
                )}
              </div>
            </CommandEmpty>

            {!searchValue && recentMembers.length > 0 && (
              <>
                <CommandGroup heading="Recent Selections">
                  {recentMembers.map(member => (
                    <MemberItem key={member.id} member={member} />
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            <CommandGroup heading={searchValue ? "Search Results" : "All Members"}>
              {filteredMembers.map(member => (
                <MemberItem key={member.id} member={member} />
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
