import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  publisher?: string;
  publication_year?: number;
  category_id?: string;
  total_copies: number;
  available_copies: number;
  location?: string;
  price?: number;
  language: string;
  pages?: number;
  description?: string;
  status: string;
  college_id?: string;
}

interface BookCategory {
  id: string;
  name: string;
  description?: string;
}

interface BookIssue {
  id: string;
  book_id: string;
  member_id: string;
  issue_date: string;
  due_date: string;
  return_date?: string;
  status: string;
  renewal_count?: number;
}

interface LibraryFine {
  id: string;
  issue_id: string;
  member_id: string;
  fine_amount: number;
  paid_amount: number;
  balance_amount: number;
  status: string;
}

interface LibraryMember {
  id: string;
  user_id?: string;
  student_id?: number;
  faculty_id?: string;
  member_type: string;
  membership_number: string;
  max_books: number;
  status: string;
}

export function useLibraryData() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch books
  const { data: books, isLoading: booksLoading } = useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('title');
      
      if (error) throw error;
      return data as Book[];
    }
  });

  // Fetch book categories
  const { data: bookCategories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['book_categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('book_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as BookCategory[];
    }
  });

  // Fetch book issues
  const { data: bookIssues, isLoading: issuesLoading } = useQuery({
    queryKey: ['book_issues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('book_issues')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as BookIssue[];
    }
  });

  // Fetch library fines
  const { data: libraryFines, isLoading: finesLoading } = useQuery({
    queryKey: ['library_fines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('library_fines')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as LibraryFine[];
    }
  });

  // Fetch library members
  const { data: libraryMembers, isLoading: membersLoading } = useQuery({
    queryKey: ['library_members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('library_members')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as LibraryMember[];
    }
  });

  // Calculate library stats
  const libraryStats = {
    totalBooks: books?.reduce((total, book) => total + book.total_copies, 0) || 0,
    availableBooks: books?.reduce((total, book) => total + book.available_copies, 0) || 0,
    issuedBooks: bookIssues?.filter(issue => issue.status === 'issued').length || 0,
    totalMembers: libraryMembers?.length || 0,
    overdueBooks: bookIssues?.filter(issue => 
      issue.status === 'issued' && new Date(issue.due_date) < new Date()
    ).length || 0
  };

  // Add book mutation
  const addBookMutation = useMutation({
    mutationFn: async (bookData: Omit<Partial<Book>, 'id'> & { title: string; author: string }) => {
      const { data, error } = await supabase
        .from('books')
        .insert([bookData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast({
        title: "Success",
        description: "Book added successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add book",
        variant: "destructive"
      });
    }
  });

  // Add category mutation
  const addCategoryMutation = useMutation({
    mutationFn: async (categoryData: Omit<Partial<BookCategory>, 'id'> & { name: string }) => {
      const { data, error } = await supabase
        .from('book_categories')
        .insert([categoryData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book_categories'] });
      toast({
        title: "Success",
        description: "Category added successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive"
      });
    }
  });

  // Issue book mutation
  const issueBookMutation = useMutation({
    mutationFn: async (issueData: {
      book_id: string;
      member_id: string;
      due_date: string;
    }) => {
      const { data, error } = await supabase
        .from('book_issues')
        .insert([{
          ...issueData,
          status: 'issued'
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book_issues'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast({
        title: "Success",
        description: "Book issued successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to issue book",
        variant: "destructive"
      });
    }
  });

  // Return book mutation
  const returnBookMutation = useMutation({
    mutationFn: async (issueId: string) => {
      const { data, error } = await supabase
        .from('book_issues')
        .update({
          status: 'returned',
          return_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', issueId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book_issues'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast({
        title: "Success",
        description: "Book returned successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to return book",
        variant: "destructive"
      });
    }
  });

  return {
    books,
    bookCategories,
    bookIssues,
    libraryFines,
    libraryMembers,
    libraryStats,
    loading: booksLoading || categoriesLoading || issuesLoading || finesLoading || membersLoading,
    addBook: addBookMutation.mutate,
    addCategory: addCategoryMutation.mutate,
    issueBook: issueBookMutation.mutate,
    returnBook: returnBookMutation.mutate,
    isAddingBook: addBookMutation.isPending,
    isAddingCategory: addCategoryMutation.isPending,
    isIssuingBook: issueBookMutation.isPending,
    isReturningBook: returnBookMutation.isPending
  };
}