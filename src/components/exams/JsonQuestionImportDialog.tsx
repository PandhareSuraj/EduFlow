import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Upload, FileJson, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MCQOption {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
}

interface ImportedQuestion {
  question_number: number;
  question_text: string;
  options: MCQOption[];
  correct_answer: 'A' | 'B' | 'C' | 'D';
  marks: number;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation?: string;
}

interface JsonQuestionImportDialogProps {
  examId: string;
  examName: string;
  existingQuestionNumbers: number[];
  totalQuestions: number;
  onImportComplete: () => void;
  trigger: React.ReactNode;
}

export function JsonQuestionImportDialog({ 
  examId, 
  examName, 
  existingQuestionNumbers,
  totalQuestions,
  onImportComplete, 
  trigger 
}: JsonQuestionImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [parsedQuestions, setParsedQuestions] = useState<ImportedQuestion[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [renumberQuestions, setRenumberQuestions] = useState(true);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateQuestion = (q: any, index: number): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!q.question_text || typeof q.question_text !== 'string' || !q.question_text.trim()) {
      errors.push(`Question ${index + 1}: Missing question text`);
    }
    
    if (!q.options || !Array.isArray(q.options) || q.options.length !== 4) {
      errors.push(`Question ${index + 1}: Must have exactly 4 options`);
    } else {
      const validKeys = ['A', 'B', 'C', 'D'];
      q.options.forEach((opt: any, i: number) => {
        if (!opt.key || !validKeys.includes(opt.key)) {
          errors.push(`Question ${index + 1}: Invalid option key at position ${i + 1}`);
        }
        if (!opt.text || typeof opt.text !== 'string' || !opt.text.trim()) {
          errors.push(`Question ${index + 1}: Option ${opt.key || i + 1} is missing text`);
        }
      });
    }
    
    if (!q.correct_answer || !['A', 'B', 'C', 'D'].includes(q.correct_answer)) {
      errors.push(`Question ${index + 1}: Invalid correct answer (must be A, B, C, or D)`);
    }
    
    if (typeof q.marks !== 'number' || q.marks <= 0) {
      errors.push(`Question ${index + 1}: Invalid marks value`);
    }
    
    if (!q.difficulty || !['easy', 'medium', 'hard'].includes(q.difficulty)) {
      errors.push(`Question ${index + 1}: Invalid difficulty (must be easy, medium, or hard)`);
    }
    
    return { valid: errors.length === 0, errors };
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    setParsedQuestions([]);
    setValidationErrors([]);
    
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      
      const questions = json.questions || json;
      
      if (!Array.isArray(questions)) {
        setValidationErrors(["Invalid JSON format: Expected an array of questions or an object with 'questions' array"]);
        return;
      }
      
      const allErrors: string[] = [];
      const validQuestions: ImportedQuestion[] = [];
      
      questions.forEach((q: any, index: number) => {
        const { valid, errors } = validateQuestion(q, index);
        if (valid) {
          validQuestions.push({
            question_number: q.question_number || index + 1,
            question_text: q.question_text.trim(),
            options: q.options.map((opt: any) => ({
              key: opt.key as 'A' | 'B' | 'C' | 'D',
              text: opt.text.trim()
            })),
            correct_answer: q.correct_answer as 'A' | 'B' | 'C' | 'D',
            marks: Number(q.marks) || 1,
            difficulty: q.difficulty as 'easy' | 'medium' | 'hard',
            explanation: q.explanation?.trim() || undefined
          });
        } else {
          allErrors.push(...errors);
        }
      });
      
      setParsedQuestions(validQuestions);
      setValidationErrors(allErrors);
      
    } catch (error: any) {
      setValidationErrors([`Failed to parse JSON: ${error.message}`]);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImport = async () => {
    if (parsedQuestions.length === 0) return;
    
    setImporting(true);
    try {
      // Calculate new question numbers if renumbering
      let questionsToInsert = parsedQuestions;
      
      if (renumberQuestions) {
        let nextNumber = 1;
        const usedNumbers = new Set(existingQuestionNumbers);
        
        questionsToInsert = parsedQuestions.map(q => {
          while (usedNumbers.has(nextNumber) && nextNumber <= totalQuestions) {
            nextNumber++;
          }
          const assignedNumber = nextNumber;
          usedNumbers.add(assignedNumber);
          nextNumber++;
          return { ...q, question_number: assignedNumber };
        });
      }
      
      // Insert questions in batches
      const batchSize = 50;
      let insertedCount = 0;
      
      for (let i = 0; i < questionsToInsert.length; i += batchSize) {
        const batch = questionsToInsert.slice(i, i + batchSize).map(q => ({
          exam_id: examId,
          question_number: q.question_number,
          question_text: q.question_text,
          options: q.options as any,
          correct_answer: q.correct_answer,
          marks: q.marks,
          difficulty: q.difficulty,
          explanation: q.explanation || null
        }));
        
        const { error } = await supabase
          .from('mcq_questions')
          .insert(batch);
        
        if (error) throw error;
        insertedCount += batch.length;
      }
      
      toast({
        title: "Import Successful",
        description: `${insertedCount} questions imported successfully`,
      });
      
      setParsedQuestions([]);
      setValidationErrors([]);
      setFileName("");
      setOpen(false);
      onImportComplete();
      
    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import questions",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  const resetDialog = () => {
    setParsedQuestions([]);
    setValidationErrors([]);
    setFileName("");
    setRenumberQuestions(true);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetDialog();
    }}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5" />
            Import JSON Questions
          </DialogTitle>
          <DialogDescription>
            Import questions from a JSON file into "{examName}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 overflow-hidden">
          {/* File Upload */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="json-file-input"
                />
                <label
                  htmlFor="json-file-input"
                  className="flex flex-col items-center gap-2 p-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors w-full"
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {fileName || "Click to select a JSON file"}
                  </span>
                </label>
              </div>
            </CardContent>
          </Card>
          
          {/* Options */}
          {parsedQuestions.length > 0 && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="renumber"
                checked={renumberQuestions}
                onCheckedChange={(checked) => setRenumberQuestions(checked === true)}
              />
              <Label htmlFor="renumber" className="text-sm">
                Auto-renumber questions to avoid conflicts
              </Label>
            </div>
          )}
          
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Card className="border-destructive">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  Validation Errors ({validationErrors.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-24">
                  <ul className="text-sm text-destructive space-y-1">
                    {validationErrors.slice(0, 10).map((error, i) => (
                      <li key={i}>• {error}</li>
                    ))}
                    {validationErrors.length > 10 && (
                      <li className="text-muted-foreground">
                        ... and {validationErrors.length - 10} more errors
                      </li>
                    )}
                  </ul>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
          
          {/* Valid Questions Preview */}
          {parsedQuestions.length > 0 && (
            <Card className="flex-1 overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Valid Questions ({parsedQuestions.length})
                </CardTitle>
                <CardDescription>
                  Preview of questions to be imported
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-40">
                  <div className="space-y-2">
                    {parsedQuestions.slice(0, 10).map((q, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm">
                        <Badge variant="outline" className="shrink-0">Q{q.question_number}</Badge>
                        <span className="truncate flex-1">{q.question_text}</span>
                        <Badge className="shrink-0">{q.difficulty}</Badge>
                      </div>
                    ))}
                    {parsedQuestions.length > 10 && (
                      <p className="text-sm text-muted-foreground text-center py-2">
                        ... and {parsedQuestions.length - 10} more questions
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={parsedQuestions.length === 0 || importing}
          >
            {importing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Import {parsedQuestions.length} Questions
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
