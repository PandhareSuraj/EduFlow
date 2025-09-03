import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLibraryData } from '@/hooks/useLibraryData';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface ReturnBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReturnBookDialog({ open, onOpenChange }: ReturnBookDialogProps) {
  const { books, bookIssues, returnBook, isReturningBook } = useLibraryData();
  
  const [selectedIssueId, setSelectedIssueId] = useState('');

  const issuedBooks = bookIssues?.filter(issue => issue.status === 'issued') || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedIssueId) {
      returnBook(selectedIssueId);
      setSelectedIssueId('');
      onOpenChange(false);
    }
  };

  const selectedIssue = issuedBooks.find(issue => issue.id === selectedIssueId);
  const selectedBook = selectedIssue ? books?.find(book => book.id === selectedIssue.book_id) : null;
  const isOverdue = selectedIssue ? new Date(selectedIssue.due_date) < new Date() : false;
  const daysOverdue = selectedIssue && isOverdue 
    ? Math.ceil((new Date().getTime() - new Date(selectedIssue.due_date).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Return Book</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="issue">Select Issued Book *</Label>
            <Select 
              value={selectedIssueId} 
              onValueChange={setSelectedIssueId}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an issued book" />
              </SelectTrigger>
              <SelectContent>
                {issuedBooks.map((issue) => {
                  const book = books?.find(b => b.id === issue.book_id);
                  const isOverdue = new Date(issue.due_date) < new Date();
                  return (
                    <SelectItem key={issue.id} value={issue.id}>
                      {book?.title} - Due: {format(new Date(issue.due_date), 'PPP')}
                      {isOverdue && ' (OVERDUE)'}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {selectedBook && selectedIssue && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <h4 className="font-medium">Book Details</h4>
              <p><strong>Title:</strong> {selectedBook.title}</p>
              <p><strong>Author:</strong> {selectedBook.author}</p>
              <p><strong>Issue Date:</strong> {format(new Date(selectedIssue.issue_date), 'PPP')}</p>
              <p><strong>Due Date:</strong> {format(new Date(selectedIssue.due_date), 'PPP')}</p>
              
              {isOverdue && (
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">Overdue</Badge>
                  <span className="text-sm text-destructive">
                    {daysOverdue} days overdue (Fine: ₹{daysOverdue * 5})
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isReturningBook || !selectedIssueId}>
              {isReturningBook ? 'Returning...' : 'Return Book'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}