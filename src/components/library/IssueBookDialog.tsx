import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLibraryData } from '@/hooks/useLibraryData';
import { addDays } from 'date-fns';
import { BookSearchCombobox } from './BookSearchCombobox';
import { MemberSearchCombobox } from './MemberSearchCombobox';

interface IssueBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IssueBookDialog({ open, onOpenChange }: IssueBookDialogProps) {
  const { books, libraryMembers, issueBook, isIssuingBook, autoCreateMembers, isCreatingMembers } = useLibraryData();
  
  const [formData, setFormData] = useState({
    book_id: '',
    member_id: '',
    loan_period: '14'
  });

  const availableBooks = books?.filter(book => book.available_copies > 0) || [];
  
  // Filter out members with invalid/missing names (orphaned records)
  const validMembers = libraryMembers?.filter(
    member => member.member_name && 
    member.member_name !== 'Unknown' && 
    member.member_name !== 'Unknown Student' && 
    member.member_name !== 'Unknown Faculty'
  ) || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dueDate = addDays(new Date(), parseInt(formData.loan_period));
    
    issueBook({
      book_id: formData.book_id,
      member_id: formData.member_id,
      due_date: dueDate.toISOString().split('T')[0]
    });
    
    setFormData({ book_id: '', member_id: '', loan_period: '14' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Issue Book</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="book">Select Book *</Label>
            <BookSearchCombobox
              books={availableBooks}
              value={formData.book_id}
              onSelect={(bookId) => setFormData({ ...formData, book_id: bookId })}
              placeholder="Search by title, author, ISBN..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="member">Select Member *</Label>
            <MemberSearchCombobox
              members={validMembers}
              value={formData.member_id}
              onSelect={(memberId) => setFormData({ ...formData, member_id: memberId })}
              onCreateMembers={autoCreateMembers}
              isCreatingMembers={isCreatingMembers}
              placeholder="Search by name, ID, email..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="loan_period">Loan Period (days)</Label>
            <Select 
              value={formData.loan_period} 
              onValueChange={(value) => setFormData({ ...formData, loan_period: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="21">21 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground">
            Due date will be: {addDays(new Date(), parseInt(formData.loan_period)).toLocaleDateString()}
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isIssuingBook || !formData.book_id || !formData.member_id}>
              {isIssuingBook ? 'Issuing...' : 'Issue Book'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}