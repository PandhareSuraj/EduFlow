import { useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Book, BookOpen, Users, Clock, AlertCircle, Plus, Search, Filter } from 'lucide-react';
import { AddBookDialog } from '@/components/library/AddBookDialog';
import { IssueBookDialog } from '@/components/library/IssueBookDialog';
import { ReturnBookDialog } from '@/components/library/ReturnBookDialog';
import { AddCategoryDialog } from '@/components/library/AddCategoryDialog';
import { EditBookDialog } from '@/components/library/EditBookDialog';
import { EditBookIssueDialog } from '@/components/library/EditBookIssueDialog';
import { LibraryStatsCard } from '@/components/library/LibraryStatsCard';
import { LibraryMemberManagement } from '@/components/library/LibraryMemberManagement';
import { useLibraryData } from '@/hooks/useLibraryData';
import { format } from 'date-fns';
import { useDebounce } from '@/hooks/useDebounce';

export default function Library() {
  const { userRole } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [addBookOpen, setAddBookOpen] = useState(false);
  const [issueBookOpen, setIssueBookOpen] = useState(false);
  const [returnBookOpen, setReturnBookOpen] = useState(false);
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);

  const {
    books,
    bookCategories,
    bookIssues,
    libraryFines,
    libraryStats,
    loading
  } = useLibraryData();

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['books'] });
    queryClient.invalidateQueries({ queryKey: ['bookIssues'] });
  };

  const isLibrarian = userRole === 'librarian' || userRole === 'admin' || userRole === 'super_admin';
  const isStudent = userRole === 'student';

  // Debounce search for performance
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Memoized filtered books
  const filteredBooks = useMemo(() => {
    return books?.filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                           book.author.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                           book.isbn?.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesCategory = !selectedCategory || book.category_id === selectedCategory;
      return matchesSearch && matchesCategory;
    }) || [];
  }, [books, debouncedSearch, selectedCategory]);

  // Memoized overdue issues
  const overdueIssues = useMemo(() => {
    return bookIssues?.filter(issue => 
      issue.status === 'issued' && new Date(issue.due_date) < new Date()
    ) || [];
  }, [bookIssues]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Library Management</h1>
          <p className="text-muted-foreground">Manage books, issues, and library operations</p>
        </div>
        {isLibrarian && (
          <div className="flex gap-2">
            <Button onClick={() => setAddCategoryOpen(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
            <Button onClick={() => setAddBookOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Book
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <LibraryStatsCard
          title="Total Books"
          value={libraryStats?.totalBooks || 0}
          icon={Book}
          description="Books in collection"
        />
        <LibraryStatsCard
          title="Available Books"
          value={libraryStats?.availableBooks || 0}
          icon={BookOpen}
          description="Ready to issue"
        />
        <LibraryStatsCard
          title="Issued Books"
          value={libraryStats?.issuedBooks || 0}
          icon={Users}
          description="Currently borrowed"
        />
        <LibraryStatsCard
          title="Overdue Books"
          value={overdueIssues.length}
          icon={AlertCircle}
          description="Past due date"
          variant={overdueIssues.length > 0 ? "destructive" : "default"}
        />
      </div>

      <Tabs defaultValue="books" className="space-y-6">
        <TabsList>
          <TabsTrigger value="books">Book Catalog</TabsTrigger>
          {isLibrarian && <TabsTrigger value="members">Library Members</TabsTrigger>}
          {isLibrarian && <TabsTrigger value="issues">Book Issues</TabsTrigger>}
          {isLibrarian && <TabsTrigger value="overdue">Overdue Books</TabsTrigger>}
          {isLibrarian && <TabsTrigger value="fines">Fines</TabsTrigger>}
          {isStudent && <TabsTrigger value="mybooks">My Books</TabsTrigger>}
        </TabsList>

        <TabsContent value="books">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Book Catalog</CardTitle>
                {isLibrarian && (
                  <div className="flex gap-2">
                    <Button onClick={() => setIssueBookOpen(true)} variant="outline">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Issue Book
                    </Button>
                    <Button onClick={() => setReturnBookOpen(true)} variant="outline">
                      <Clock className="h-4 w-4 mr-2" />
                      Return Book
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex gap-4 mt-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search books by title, author, or ISBN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-md"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="">All Categories</option>
                  {bookCategories?.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>ISBN</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Total Copies</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBooks.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell className="font-medium">{book.title}</TableCell>
                      <TableCell>{book.author}</TableCell>
                      <TableCell>
                        {bookCategories?.find(cat => cat.id === book.category_id)?.name || 'N/A'}
                      </TableCell>
                      <TableCell>{book.isbn || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={book.available_copies > 0 ? "default" : "destructive"}>
                          {book.available_copies}
                        </Badge>
                      </TableCell>
                      <TableCell>{book.total_copies}</TableCell>
                      <TableCell>
                        <Badge variant={book.status === 'active' ? "default" : "secondary"}>
                          {book.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {isLibrarian && (
                          <EditBookDialog
                            book={book}
                            categories={bookCategories || []}
                            onUpdate={refreshData}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {isLibrarian && (
          <TabsContent value="members">
            <LibraryMemberManagement />
          </TabsContent>
        )}

        {isLibrarian && (
          <TabsContent value="issues">
            <Card>
              <CardHeader>
                <CardTitle>Book Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book Title</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookIssues?.filter(issue => issue.status === 'issued').map((issue) => {
                      const book = books?.find(b => b.id === issue.book_id);
                      const isOverdue = new Date(issue.due_date) < new Date();
                      return (
                        <TableRow key={issue.id}>
                          <TableCell className="font-medium">{book?.title}</TableCell>
                          <TableCell>{issue.member_id}</TableCell>
                          <TableCell>{format(new Date(issue.issue_date), 'PPP')}</TableCell>
                          <TableCell>
                            <span className={isOverdue ? 'text-destructive font-medium' : ''}>
                              {format(new Date(issue.due_date), 'PPP')}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={isOverdue ? "destructive" : "default"}>
                              {isOverdue ? 'Overdue' : 'Issued'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <EditBookIssueDialog
                                issue={issue}
                                bookTitle={book?.title}
                                onUpdate={refreshData}
                              />
                              <Button size="sm" variant="outline">
                                Renew
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {isLibrarian && (
          <TabsContent value="overdue">
            <Card>
              <CardHeader>
                <CardTitle>Overdue Books</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book Title</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Days Overdue</TableHead>
                      <TableHead>Fine Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overdueIssues.map((issue) => {
                      const book = books?.find(b => b.id === issue.book_id);
                      const daysOverdue = Math.ceil(
                        (new Date().getTime() - new Date(issue.due_date).getTime()) / (1000 * 60 * 60 * 24)
                      );
                      const fine = libraryFines?.find(f => f.issue_id === issue.id);
                      return (
                        <TableRow key={issue.id}>
                          <TableCell className="font-medium">{book?.title}</TableCell>
                          <TableCell>{issue.member_id}</TableCell>
                          <TableCell className="text-destructive">
                            {format(new Date(issue.due_date), 'PPP')}
                          </TableCell>
                          <TableCell className="text-destructive font-medium">
                            {daysOverdue} days
                          </TableCell>
                          <TableCell>
                            ₹{fine?.fine_amount || daysOverdue * 5}
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              Send Notice
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {isLibrarian && (
          <TabsContent value="fines">
            <Card>
              <CardHeader>
                <CardTitle>Library Fines</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Book Title</TableHead>
                      <TableHead>Fine Amount</TableHead>
                      <TableHead>Paid Amount</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {libraryFines?.map((fine) => {
                      const issue = bookIssues?.find(i => i.id === fine.issue_id);
                      const book = books?.find(b => b.id === issue?.book_id);
                      return (
                        <TableRow key={fine.id}>
                          <TableCell>{fine.member_id}</TableCell>
                          <TableCell>{book?.title}</TableCell>
                          <TableCell>₹{fine.fine_amount}</TableCell>
                          <TableCell>₹{fine.paid_amount}</TableCell>
                          <TableCell>₹{fine.balance_amount}</TableCell>
                          <TableCell>
                            <Badge variant={
                              fine.status === 'paid' ? 'default' :
                              fine.status === 'waived' ? 'secondary' : 'destructive'
                            }>
                              {fine.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {fine.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  Collect
                                </Button>
                                <Button size="sm" variant="outline">
                                  Waive
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {isStudent && (
          <TabsContent value="mybooks">
            <Card>
              <CardHeader>
                <CardTitle>My Borrowed Books</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* This would be filtered based on current user's membeship */}
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No books currently borrowed
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Dialogs */}
      <AddBookDialog open={addBookOpen} onOpenChange={setAddBookOpen} />
      <IssueBookDialog open={issueBookOpen} onOpenChange={setIssueBookOpen} />
      <ReturnBookDialog open={returnBookOpen} onOpenChange={setReturnBookOpen} />
      <AddCategoryDialog open={addCategoryOpen} onOpenChange={setAddCategoryOpen} />
    </div>
  );
}