import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, BookOpen, TrendingUp, LogIn } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Only show landing page for non-authenticated users
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">EduERP Platform</span>
          </div>
          <Button onClick={() => navigate('/auth')}>
            <LogIn className="mr-2 h-4 w-4" />
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Complete College Management Platform
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Powerful ERP System for Educational Institutions of All Types
          </p>
          <Button size="lg" onClick={() => navigate('/auth')} className="shadow-elegant">
            Access Your Institution
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">Platform Features</h2>
        <p className="text-center text-muted-foreground mb-12">Supporting educational institutions across all disciplines</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="shadow-card">
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Multi-College Management</CardTitle>
              <CardDescription>
                Manage multiple educational institutions from a single platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Centralized Administration</li>
                <li>• Institution-wise Data Segregation</li>
                <li>• Cross-Institution Reporting</li>
                <li>• Role-based Access Control</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <BookOpen className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Academic Excellence</CardTitle>
              <CardDescription>
                Complete academic lifecycle management for any institution type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Student Management System</li>
                <li>• Course & Curriculum Planning</li>
                <li>• Examination & Assessment</li>
                <li>• Faculty Performance Tracking</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Smart Administration</CardTitle>
              <CardDescription>
                Advanced tools for efficient institutional operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Financial Management</li>
                <li>• Library & Inventory</li>
                <li>• Analytics & Insights</li>
                <li>• Compliance & Reporting</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Additional Features Section */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Supporting All Institution Types</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our platform adapts to your institution's unique needs, whether you're running a medical college, 
            engineering institute, arts college, or any other educational establishment.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4">
            <div className="text-2xl mb-2">🏥</div>
            <h3 className="font-semibold">Medical Colleges</h3>
          </div>
          <div className="text-center p-4">
            <div className="text-2xl mb-2">⚙️</div>
            <h3 className="font-semibold">Engineering</h3>
          </div>
          <div className="text-center p-4">
            <div className="text-2xl mb-2">🎨</div>
            <h3 className="font-semibold">Arts & Sciences</h3>
          </div>
          <div className="text-center p-4">
            <div className="text-2xl mb-2">💼</div>
            <h3 className="font-semibold">Commerce</h3>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>© 2024 EduERP Platform. Empowering Educational Institutions.</p>
        </div>
      </footer>
    </div>
  );
}
