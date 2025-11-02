import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Book {
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
  category?: string;
}

export interface BookCategory {
  id: string;
  name: string;
  description?: string;
}

export interface BookIssue {
  id: string;
  book_id: string;
  member_id: string;
  issue_date: string;
  due_date: string;
  return_date?: string;
  status: string;
  renewal_count?: number;
}

export interface LibraryFine {
  id: string;
  issue_id: string;
  member_id: string;
  fine_amount: number;
  paid_amount: number;
  balance_amount: number;
  status: string;
}

export interface LibraryMember {
  id: string;
  user_id?: string;
  student_id?: number;
  faculty_id?: string;
  member_type: string;
  membership_number: string;
  max_books: number;
  status: string;
  membership_start_date?: string;
  created_at?: string;
  member_name?: string;
  member_email?: string;
  phone?: string;
  department?: string;
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
        .select(`
          *,
          book_categories (
            name
          )
        `)
        .order('title');
      
      if (error) throw error;
      return (data || []).map(book => ({
        ...book,
        category: (book as any).book_categories?.name || undefined
      })) as Book[];
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

  // Fetch library members with names using JOIN for better performance
  const { data: libraryMembers, isLoading: membersLoading } = useQuery({
    queryKey: ['library_members'],
    queryFn: async () => {
      // Single query with JOINs - much faster than N+1 queries!
      const { data, error } = await supabase
        .from('library_members')
        .select(`
          *,
          students!fk_library_members_student (
            name,
            email
          ),
          faculty!fk_library_members_faculty (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });
      
      // If JOIN isn't available yet in schema cache, fallback to safe N+1 approach
      if (error) {
        const { data: baseMembers, error: baseError } = await supabase
          .from('library_members')
          .select('*')
          .order('created_at', { ascending: false });
        if (baseError || !baseMembers) throw (baseError || error);

        const membersWithNames = await Promise.all(
          baseMembers.map(async (member) => {
            let memberName = 'Unknown';
            let memberEmail = '';

            if (member.member_type === 'student' && member.student_id) {
              const { data: student } = await supabase
                .from('students')
                .select('name, email')
                .eq('id', member.student_id)
                .single();
              if (student) {
                memberName = (student as any).name;
                memberEmail = (student as any).email;
              }
            } else if (member.member_type === 'faculty' && member.faculty_id) {
              const { data: faculty } = await supabase
                .from('faculty')
                .select('name, email')
                .eq('id', member.faculty_id)
                .single();
              if (faculty) {
                memberName = (faculty as any).name;
                memberEmail = (faculty as any).email;
              }
            }

            return { ...member, member_name: memberName, member_email: memberEmail } as LibraryMember;
          })
        );

        return membersWithNames as LibraryMember[];
      }
      
      // Transform the data to match the expected format
      return (data || []).map(member => ({
        ...member,
        member_name: member.member_type === 'student' 
          ? (member as any).students?.name || 'Unknown Student'
          : (member as any).faculty?.name || 'Unknown Faculty',
        member_email: member.member_type === 'student'
          ? (member as any).students?.email || ''
          : (member as any).faculty?.email || ''
      })) as LibraryMember[];
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

  // Auto-create library members mutation
  const autoCreateMembersMutation = useMutation({
    mutationFn: async () => {
      // Get active students and faculty
      const [studentsResult, facultyResult] = await Promise.all([
        supabase.from('students').select('id, name, email').eq('status', 'active'),
        supabase.from('faculty').select('id, name, email').eq('status', 'active')
      ]);

      if (studentsResult.error) throw studentsResult.error;
      if (facultyResult.error) throw facultyResult.error;

      const existingMembers = libraryMembers || [];
      const existingStudentIds = existingMembers
        .filter(m => m.member_type === 'student' && m.student_id)
        .map(m => m.student_id);
      const existingFacultyIds = existingMembers
        .filter(m => m.member_type === 'faculty' && m.faculty_id)
        .map(m => m.faculty_id);

      const newMembers = [];

      // Add students not already members - validate they exist and are active
      studentsResult.data.forEach(student => {
        if (student.id && !existingStudentIds.includes(student.id)) {
          newMembers.push({
            student_id: student.id,
            member_type: 'student',
            max_books: 3,
            status: 'active'
          });
        }
      });

      // Add faculty not already members - validate they exist and are active
      facultyResult.data.forEach(faculty => {
        if (faculty.id && !existingFacultyIds.includes(faculty.id)) {
          newMembers.push({
            faculty_id: faculty.id,
            member_type: 'faculty',
            max_books: 5,
            status: 'active'
          });
        }
      });

      if (newMembers.length === 0) {
        return { created: 0, message: 'All active users are already library members' };
      }

      const { data, error } = await supabase
        .from('library_members')
        .insert(newMembers)
        .select();

      if (error) throw error;
      return { created: data.length, message: `Created ${data.length} library members` };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['library_members'] });
      toast({
        title: "Success",
        description: result.message
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create library members",
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
    autoCreateMembers: autoCreateMembersMutation.mutate,
    isAddingBook: addBookMutation.isPending,
    isAddingCategory: addCategoryMutation.isPending,
    isIssuingBook: issueBookMutation.isPending,
    isReturningBook: returnBookMutation.isPending,
    isCreatingMembers: autoCreateMembersMutation.isPending
  };
}