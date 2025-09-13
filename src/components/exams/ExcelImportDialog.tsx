import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Upload, FileSpreadsheet, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';

interface ExcelImportDialogProps {
  examId: string;
  examName: string;
  onImportComplete?: () => void;
  trigger?: React.ReactNode;
}

interface ImportedQuestion {
  question_number: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  marks: number;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation?: string;
  errors: string[];
}

export function ExcelImportDialog({ examId, examName, onImportComplete, trigger }: ExcelImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importedQuestions, setImportedQuestions] = useState<ImportedQuestion[]>([]);
  const [validQuestions, setValidQuestions] = useState<ImportedQuestion[]>([]);
  const [invalidQuestions, setInvalidQuestions] = useState<ImportedQuestion[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const downloadTemplate = () => {
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
      },
      {
        'Question Number': 2,
        'Question Text': 'What is 2 + 2?',
        'Option A': '3',
        'Option B': '4',
        'Option C': '5',
        'Option D': '6',
        'Correct Answer': 'B',
        'Marks': 1,
        'Difficulty': 'easy',
        'Explanation': 'Basic arithmetic: 2 + 2 = 4'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'MCQ Questions');
    
    // Set column widths
    ws['!cols'] = [
      { wch: 10 }, // Question Number
      { wch: 50 }, // Question Text
      { wch: 20 }, // Option A
      { wch: 20 }, // Option B
      { wch: 20 }, // Option C
      { wch: 20 }, // Option D
      { wch: 15 }, // Correct Answer
      { wch: 8 },  // Marks
      { wch: 12 }, // Difficulty
      { wch: 30 }  // Explanation
    ];

    XLSX.writeFile(wb, `MCQ_Questions_Template_${examName.replace(/\s+/g, '_')}.xlsx`);
    
    toast({
      title: "Template Downloaded",
      description: "Excel template has been downloaded successfully",
    });
  };

  const validateQuestion = (question: any, index: number): ImportedQuestion => {
    const errors: string[] = [];
    
    // Validate required fields
    if (!question['Question Number'] || isNaN(question['Question Number'])) {
      errors.push('Invalid question number');
    }
    if (!question['Question Text'] || question['Question Text'].trim().length === 0) {
      errors.push('Question text is required');
    }
    if (!question['Option A'] || question['Option A'].trim().length === 0) {
      errors.push('Option A is required');
    }
    if (!question['Option B'] || question['Option B'].trim().length === 0) {
      errors.push('Option B is required');
    }
    if (!question['Option C'] || question['Option C'].trim().length === 0) {
      errors.push('Option C is required');
    }
    if (!question['Option D'] || question['Option D'].trim().length === 0) {
      errors.push('Option D is required');
    }
    
    // Validate correct answer
    const correctAnswer = question['Correct Answer']?.toString().toUpperCase();
    if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
      errors.push('Correct answer must be A, B, C, or D');
    }
    
    // Validate marks
    const marks = parseFloat(question['Marks']);
    if (isNaN(marks) || marks <= 0) {
      errors.push('Marks must be a positive number');
    }
    
    // Validate difficulty
    const difficulty = question['Difficulty']?.toString().toLowerCase();
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      errors.push('Difficulty must be easy, medium, or hard');
    }

    return {
      question_number: parseInt(question['Question Number']) || index + 1,
      question_text: question['Question Text']?.toString().trim() || '',
      option_a: question['Option A']?.toString().trim() || '',
      option_b: question['Option B']?.toString().trim() || '',
      option_c: question['Option C']?.toString().trim() || '',
      option_d: question['Option D']?.toString().trim() || '',
      correct_answer: correctAnswer as 'A' | 'B' | 'C' | 'D',
      marks: marks || 1,
      difficulty: difficulty as 'easy' | 'medium' | 'hard',
      explanation: question['Explanation']?.toString().trim() || '',
      errors
    };
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls)$/)) {
      toast({
        title: "Invalid File",
        description: "Please upload an Excel file (.xlsx or .xls)",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          if (jsonData.length === 0) {
            toast({
              title: "Empty File",
              description: "The uploaded Excel file is empty",
              variant: "destructive",
            });
            return;
          }

          // Validate and process questions
          const processedQuestions = jsonData.map((row, index) => validateQuestion(row, index));
          
          const valid = processedQuestions.filter(q => q.errors.length === 0);
          const invalid = processedQuestions.filter(q => q.errors.length > 0);

          setImportedQuestions(processedQuestions);
          setValidQuestions(valid);
          setInvalidQuestions(invalid);

          toast({
            title: "File Processed",
            description: `Found ${valid.length} valid questions and ${invalid.length} invalid questions`,
          });

        } catch (error) {
          console.error('Error processing Excel file:', error);
          toast({
            title: "Processing Error",
            description: "Failed to process the Excel file. Please check the format.",
            variant: "destructive",
          });
        }
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error reading file:', error);
      toast({
        title: "Upload Error",
        description: "Failed to read the uploaded file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleImport = async () => {
    if (validQuestions.length === 0) {
      toast({
        title: "No Valid Questions",
        description: "There are no valid questions to import",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);
    setImportProgress(0);

    try {
      // Get college ID
      const { data: collegeData, error: collegeError } = await supabase.rpc('get_user_college');
      if (collegeError) throw collegeError;

      let successCount = 0;
      const batchSize = 10;
      
      for (let i = 0; i < validQuestions.length; i += batchSize) {
        const batch = validQuestions.slice(i, i + batchSize);
        
        const questionsToInsert = batch.map(question => ({
          exam_id: examId,
          question_number: question.question_number,
          question_text: question.question_text,
          options: [
            { key: 'A', text: question.option_a },
            { key: 'B', text: question.option_b },
            { key: 'C', text: question.option_c },
            { key: 'D', text: question.option_d }
          ],
          correct_answer: question.correct_answer,
          marks: question.marks,
          difficulty: question.difficulty,
          explanation: question.explanation || null,
          college_id: collegeData
        }));

        const { error } = await supabase
          .from('mcq_questions')
          .insert(questionsToInsert);

        if (error) {
          console.error('Error inserting batch:', error);
          // Continue with next batch even if one fails
        } else {
          successCount += batch.length;
        }

        // Update progress
        const progress = Math.round(((i + batch.length) / validQuestions.length) * 100);
        setImportProgress(progress);
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      toast({
        title: "Import Complete",
        description: `Successfully imported ${successCount} out of ${validQuestions.length} questions`,
      });

      // Reset state and close dialog
      setImportedQuestions([]);
      setValidQuestions([]);
      setInvalidQuestions([]);
      setImportProgress(0);
      setOpen(false);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Notify parent component
      onImportComplete?.();

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import Excel
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import MCQ Questions from Excel
          </DialogTitle>
          <DialogDescription>
            Upload an Excel file with MCQ questions for "{examName}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Download */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <h4 className="font-medium">Download Template</h4>
              <p className="text-sm text-muted-foreground">
                Get the Excel template with sample questions and formatting
              </p>
            </div>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <Label htmlFor="excel-file">Upload Excel File</Label>
            <Input
              ref={fileInputRef}
              id="excel-file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              disabled={uploading || importing}
            />
            {uploading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing file...
              </div>
            )}
          </div>

          {/* Import Progress */}
          {importing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Importing questions...</span>
                <span>{importProgress}%</span>
              </div>
              <Progress value={importProgress} className="w-full" />
            </div>
          )}

          {/* Import Summary */}
          {importedQuestions.length > 0 && !importing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{validQuestions.length}</strong> valid questions ready to import
                  </AlertDescription>
                </Alert>
                
                {invalidQuestions.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>{invalidQuestions.length}</strong> questions have errors
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Invalid Questions Table */}
              {invalidQuestions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-destructive">Questions with Errors:</h4>
                  <div className="max-h-40 overflow-y-auto border rounded">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Row</TableHead>
                          <TableHead>Question</TableHead>
                          <TableHead>Errors</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invalidQuestions.map((question, index) => (
                          <TableRow key={index}>
                            <TableCell>{question.question_number}</TableCell>
                            <TableCell className="max-w-xs truncate">
                              {question.question_text || 'Missing question text'}
                            </TableCell>
                            <TableCell>
                              {question.errors.map((error, i) => (
                                <Badge key={i} variant="destructive" className="mr-1 mb-1">
                                  {error}
                                </Badge>
                              ))}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={importing}>
            Cancel
          </Button>
          {validQuestions.length > 0 && (
            <Button onClick={handleImport} disabled={importing}>
              {importing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import {validQuestions.length} Questions
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}