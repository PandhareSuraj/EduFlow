import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Edit, Trash2, Save, FileText, Loader2, HelpCircle, Upload, Download, FileJson } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ExcelImportDialog } from "./ExcelImportDialog";
import { JsonQuestionImportDialog } from "./JsonQuestionImportDialog";
import * as XLSX from 'xlsx';

interface MCQOption {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
}

interface MCQQuestion {
  id?: string;
  question_number: number;
  question_text: string;
  options: MCQOption[];
  correct_answer: 'A' | 'B' | 'C' | 'D';
  marks: number;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation?: string;
}

interface Exam {
  id: string;
  name: string;
  total_questions: number;
  total_marks: number;
  exam_type?: string;
  actual_question_count?: number;
}

interface MCQQuestionBuilderProps {
  exam: Exam;
  onQuestionsUpdated?: () => void;
}

export function MCQQuestionBuilder({ exam, onQuestionsUpdated }: MCQQuestionBuilderProps) {
  const [open, setOpen] = useState(false);
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<MCQQuestion | null>(null);
  const [questionForm, setQuestionForm] = useState<Omit<MCQQuestion, 'id'>>({
    question_number: 1,
    question_text: "",
    options: [
      { key: 'A', text: '' },
      { key: 'B', text: '' },
      { key: 'C', text: '' },
      { key: 'D', text: '' }
    ],
    correct_answer: 'A',
    marks: 1,
    difficulty: 'medium',
    explanation: ""
  });
  const { toast } = useToast();

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('mcq_questions')
        .select('*')
        .eq('exam_id', exam.id)
        .order('question_number');

      if (error) throw error;

      const questionsData = (data || []).map(q => ({
        ...q,
        options: Array.isArray(q.options) ? q.options as unknown as MCQOption[] : [],
        correct_answer: q.correct_answer as 'A' | 'B' | 'C' | 'D',
        difficulty: q.difficulty as 'easy' | 'medium' | 'hard'
      }));

      setQuestions(questionsData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load questions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchQuestions();
    }
  }, [open]);

  const getNextQuestionNumber = () => {
    if (questions.length === 0) return 1;
    const usedNumbers = questions.map(q => q.question_number).sort((a, b) => a - b);
    const totalQuestions = exam.total_questions || 30;
    for (let i = 1; i <= totalQuestions; i++) {
      if (!usedNumbers.includes(i)) {
        return i;
      }
    }
    return questions.length + 1;
  };

  const resetForm = () => {
    setQuestionForm({
      question_number: getNextQuestionNumber(),
      question_text: "",
      options: [
        { key: 'A', text: '' },
        { key: 'B', text: '' },
        { key: 'C', text: '' },
        { key: 'D', text: '' }
      ],
      correct_answer: 'A',
      marks: 1,
      difficulty: 'medium',
      explanation: ""
    });
    setEditingQuestion(null);
  };

  const handleSaveQuestion = async () => {
    if (!questionForm.question_text.trim()) {
      toast({
        title: "Validation Error",
        description: "Question text is required",
        variant: "destructive"
      });
      return;
    }

    const emptyOptions = questionForm.options.filter(opt => !opt.text.trim());
    if (emptyOptions.length > 0) {
      toast({
        title: "Validation Error",
        description: "All options must have text",
        variant: "destructive"
      });
      return;
    }

    // Check for duplicate question number if not editing
    if (!editingQuestion) {
      const existingQuestion = questions.find(q => q.question_number === questionForm.question_number);
      if (existingQuestion) {
        toast({
          title: "Validation Error",
          description: `Question number ${questionForm.question_number} is already used. Please choose a different number.`,
          variant: "destructive"
        });
        return;
      }
    }

    setSaving(true);
    try {
      const questionData = {
        exam_id: exam.id,
        question_number: questionForm.question_number,
        question_text: questionForm.question_text.trim(),
        options: questionForm.options as any,
        correct_answer: questionForm.correct_answer,
        marks: questionForm.marks,
        difficulty: questionForm.difficulty,
        explanation: questionForm.explanation?.trim() || null
      };

      let result;
      if (editingQuestion) {
        result = await supabase
          .from('mcq_questions')
          .update(questionData)
          .eq('id', editingQuestion.id)
          .select();
        
        if (result.error) throw result.error;
        
        toast({
          title: "Question Updated",
          description: "Question has been updated successfully",
        });
      } else {
        result = await supabase
          .from('mcq_questions')
          .insert([questionData])
          .select();
        
        if (result.error) {
          if (result.error.code === '23505' && result.error.message.includes('unique_question_number_per_exam')) {
            toast({
              title: "Duplicate Question Number",
              description: `Question number ${questionForm.question_number} already exists for this exam. Please choose a different number.`,
              variant: "destructive"
            });
            return;
          }
          throw result.error;
        }
        
        toast({
          title: "Question Added",
          description: "Question has been added successfully",
        });
      }

      // Refresh questions list first, then reset form with correct next question number
      await fetchQuestions();
      resetForm();
      
      onQuestionsUpdated?.();
    } catch (error: any) {
      console.error('Error saving question:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save question",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEditQuestion = (question: MCQQuestion) => {
    setEditingQuestion(question);
    setQuestionForm({
      question_number: question.question_number,
      question_text: question.question_text,
      options: question.options,
      correct_answer: question.correct_answer,
      marks: question.marks,
      difficulty: question.difficulty,
      explanation: question.explanation || ""
    });
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const { error } = await supabase
        .from('mcq_questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;

      toast({
        title: "Question Deleted",
        description: "Question has been deleted successfully",
      });

      fetchQuestions();
      onQuestionsUpdated?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete question",
        variant: "destructive"
      });
    }
  };

  const updateOption = (key: 'A' | 'B' | 'C' | 'D', text: string) => {
    setQuestionForm({
      ...questionForm,
      options: questionForm.options.map(opt => 
        opt.key === key ? { ...opt, text } : opt
      )
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'hard': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <HelpCircle className="h-4 w-4 mr-2" />
          Manage Questions ({exam.actual_question_count || 0}/{exam.total_questions || 30})
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="sm:max-w-[1000px] h-[90vh] flex flex-col"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>MCQ Questions - {exam.name}</DialogTitle>
          <DialogDescription>
            Add and manage multiple choice questions for this exam.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 overflow-hidden">
          <div className="space-y-6 pr-4 pb-4">
          {/* Question Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {editingQuestion ? 'Edit Question' : 'Add New Question'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="question_number">Question Number</Label>
                  <Input
                    id="question_number"
                    type="number"
                    min="1"
                    max={exam.total_questions || 30}
                    value={questionForm.question_number}
                    onChange={(e) => setQuestionForm({
                      ...questionForm,
                      question_number: parseInt(e.target.value)
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="marks">Marks</Label>
                  <Input
                    id="marks"
                    type="number"
                    min="0.5"
                    max="10"
                    step="0.5"
                    value={questionForm.marks}
                    onChange={(e) => setQuestionForm({
                      ...questionForm,
                      marks: parseFloat(e.target.value)
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select 
                    value={questionForm.difficulty} 
                    onValueChange={(value: 'easy' | 'medium' | 'hard') => 
                      setQuestionForm({...questionForm, difficulty: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="question_text">Question</Label>
                <Textarea
                  id="question_text"
                  value={questionForm.question_text}
                  onChange={(e) => setQuestionForm({
                    ...questionForm,
                    question_text: e.target.value
                  })}
                  placeholder="Enter the question..."
                  rows={3}
                />
              </div>

              <div className="grid gap-4">
                <Label>Options</Label>
                {questionForm.options.map((option) => (
                  <div key={option.key} className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correct_answer"
                        checked={questionForm.correct_answer === option.key}
                        onChange={() => setQuestionForm({
                          ...questionForm,
                          correct_answer: option.key
                        })}
                        className="w-4 h-4"
                      />
                      <Label className="font-medium">{option.key}:</Label>
                    </div>
                    <Input
                      value={option.text}
                      onChange={(e) => updateOption(option.key, e.target.value)}
                      placeholder={`Option ${option.key}`}
                      className="flex-1"
                    />
                  </div>
                ))}
                <p className="text-sm text-muted-foreground">
                  Select the radio button for the correct answer
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="explanation">Explanation (Optional)</Label>
                <Textarea
                  id="explanation"
                  value={questionForm.explanation}
                  onChange={(e) => setQuestionForm({
                    ...questionForm,
                    explanation: e.target.value
                  })}
                  placeholder="Explain why this answer is correct..."
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveQuestion} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingQuestion ? 'Update' : 'Add'} Question
                    </>
                  )}
                </Button>
                {editingQuestion && (
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Questions List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Questions ({questions.length}/{exam.total_questions || 30})</CardTitle>
                <CardDescription>
                  Questions added to this exam
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    const templateData = [
                      {
                        'Question Number': 1,
                        'Question Text': 'What is the capital of India?',
                        'Option A': 'Mumbai',
                        'Option B': 'Delhi',
                        'Option C': 'Kolkata',
                        'Option D': 'Chennai',
                        'Correct Answer': 'B',
                        'Marks': 2,
                        'Difficulty': 'easy',
                        'Explanation': 'Delhi is the national capital of India'
                      }
                    ];
                    
                    // Quick template download without opening dialog
                    const ws = XLSX.utils.json_to_sheet(templateData);
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, 'MCQ Questions');
                    XLSX.writeFile(wb, `MCQ_Template_${exam.name.replace(/\s+/g, '_')}.xlsx`);
                    
                    toast({
                      title: "Template Downloaded",
                      description: "Excel template has been downloaded",
                    });
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Template
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (questions.length === 0) {
                      toast({
                        title: "No Questions",
                        description: "Add questions first before downloading",
                        variant: "destructive"
                      });
                      return;
                    }
                    
                    const exportData = {
                      exam_name: exam.name,
                      exported_at: new Date().toISOString(),
                      total_questions: questions.length,
                      questions: questions.map(q => ({
                        question_number: q.question_number,
                        question_text: q.question_text,
                        options: q.options,
                        correct_answer: q.correct_answer,
                        marks: q.marks,
                        difficulty: q.difficulty,
                        explanation: q.explanation || null
                      }))
                    };
                    
                    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Questions_${exam.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    
                    toast({
                      title: "Questions Downloaded",
                      description: `${questions.length} questions exported as JSON`,
                    });
                  }}
                >
                  <FileJson className="h-4 w-4 mr-2" />
                  Download JSON
                </Button>
                <ExcelImportDialog 
                  examId={exam.id}
                  examName={exam.name}
                  onImportComplete={() => {
                    fetchQuestions();
                    onQuestionsUpdated?.();
                  }}
                  trigger={
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Import Excel
                    </Button>
                  }
                />
                <JsonQuestionImportDialog
                  examId={exam.id}
                  examName={exam.name}
                  existingQuestionNumbers={questions.map(q => q.question_number)}
                  totalQuestions={exam.total_questions || 30}
                  onImportComplete={() => {
                    fetchQuestions();
                    onQuestionsUpdated?.();
                  }}
                  trigger={
                    <Button variant="outline" size="sm">
                      <FileJson className="h-4 w-4 mr-2" />
                      Import JSON
                    </Button>
                  }
                />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : questions.length > 0 ? (
                <ScrollArea className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Q#</TableHead>
                        <TableHead>Question</TableHead>
                        <TableHead>Answer</TableHead>
                        <TableHead>Marks</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {questions.map((question) => (
                        <TableRow key={question.id}>
                          <TableCell className="font-medium">
                            {question.question_number}
                          </TableCell>
                          <TableCell className="max-w-md">
                            <div className="truncate">
                              {question.question_text}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {question.correct_answer}
                            </Badge>
                          </TableCell>
                          <TableCell>{question.marks}</TableCell>
                          <TableCell>
                            <Badge className={getDifficultyColor(question.difficulty)}>
                              {question.difficulty}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditQuestion(question)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteQuestion(question.id!)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : (
                <div className="text-center py-8">
                  <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Questions Added</h3>
                  <p className="text-muted-foreground">
                    Start adding questions to complete your MCQ exam.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}