import { useState, useMemo } from 'react';
import { Check, Search, Book as BookIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Book } from '@/hooks/useLibraryData';

interface BookSearchComboboxProps {
  books: Book[];
  value: string;
  onSelect: (bookId: string) => void;
  placeholder?: string;
  className?: string;
}

export function BookSearchCombobox({
  books,
  value,
  onSelect,
  placeholder = "Search books...",
  className
}: BookSearchComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const selectedBook = useMemo(
    () => books.find((book) => book.id === value),
    [books, value]
  );

  const filteredBooks = useMemo(() => {
    if (!searchValue) return books;
    
    const search = searchValue.toLowerCase();
    return books.filter(book => 
      book.title.toLowerCase().includes(search) ||
      book.author.toLowerCase().includes(search) ||
      book.isbn?.toLowerCase().includes(search) ||
      book.category?.toLowerCase().includes(search)
    );
  }, [books, searchValue]);

  const handleSelect = (bookId: string) => {
    onSelect(bookId);
    setOpen(false);
    setSearchValue("");
  };

  const handleClear = () => {
    onSelect("");
    setSearchValue("");
  };

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
            <BookIcon className="h-4 w-4 shrink-0 opacity-50" />
            {selectedBook ? (
              <span className="truncate">
                {selectedBook.title} by {selectedBook.author}
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {selectedBook && (
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
            placeholder="Search by title, author, ISBN, or category..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>
              <div className="py-6 text-center text-sm">
                <BookIcon className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="font-medium">No books found</p>
                <p className="text-muted-foreground mt-1">
                  Try searching with different keywords
                </p>
              </div>
            </CommandEmpty>
            <CommandGroup>
              {filteredBooks.map((book) => (
                <CommandItem
                  key={book.id}
                  value={book.id}
                  onSelect={() => handleSelect(book.id)}
                  className="flex items-start gap-3 p-3 cursor-pointer"
                >
                  <Check
                    className={cn(
                      "h-4 w-4 shrink-0 mt-1",
                      value === book.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium">{book.title}</div>
                      <div className={cn(
                        "text-xs px-2 py-0.5 rounded-full shrink-0",
                        book.available_copies > 5 
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : book.available_copies > 0
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      )}>
                        {book.available_copies} available
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      by {book.author}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {book.isbn && (
                        <span>ISBN: {book.isbn}</span>
                      )}
                      {book.category && (
                        <span className="px-2 py-0.5 rounded-md bg-muted">
                          {book.category}
                        </span>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
