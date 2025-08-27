
"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { generateQuiz, GenerateQuizOutput } from "@/ai/flows/smart-quiz-generation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Lightbulb } from "lucide-react";
import { Quiz } from "@/services/topic-service";

type QuizGeneratorDialogProps = {
    onSave: (quiz: Omit<Quiz, 'id'>) => void;
};

export function QuizGeneratorDialog({ onSave }: QuizGeneratorDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [material, setMaterial] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [quizTitle, setQuizTitle] = useState("");
  const [generatedQuiz, setGeneratedQuiz] = useState<GenerateQuizOutput | null>(null);
  const [open, setOpen] = useState(false);


  const handleGenerate = async () => {
    setLoading(true);
    setGeneratedQuiz(null);
    try {
      const result = await generateQuiz({
        learningMaterial: material,
        numberOfQuestions: numQuestions,
      });
      setGeneratedQuiz(result);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error Generating Quiz",
        description: "There was an issue creating the quiz. Please try again.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };
  
  const handleSaveQuiz = () => {
    if (!generatedQuiz || !quizTitle) {
      toast({
        title: "Missing Information",
        description: "Please generate a quiz and provide a title before saving.",
        variant: "destructive"
      });
      return;
    }
    
    // The AI returns a stringified JSON, so we need to parse it.
    const parsedQuizData = JSON.parse(generatedQuiz.quiz);

    const quizToSave: Omit<Quiz, 'id'> = {
        title: quizTitle,
        questions: parsedQuizData.quiz
    };

    onSave(quizToSave);
    setOpen(false); // Close dialog on save
    // Reset state for next time
    setMaterial("");
    setNumQuestions(5);
    setQuizTitle("");
    setGeneratedQuiz(null);
  }

  return (
     <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
            <Lightbulb className="mr-2 h-4 w-4"/>
            Create New Quiz
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Smart Quiz Generation</DialogTitle>
          <DialogDescription>
            Paste in any learning material to automatically generate a practice quiz for this topic.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
           <div className="grid gap-2">
            <Label htmlFor="quiz-title">Quiz Title</Label>
            <Input 
                id="quiz-title" 
                placeholder="e.g., 'Chapter 1 Review'" 
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="material">Learning Material</Label>
            <Textarea 
                id="material" 
                placeholder="Paste your content here..." 
                rows={10} 
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="num-questions">Number of Questions</Label>
            <Input 
                id="num-questions" 
                type="number" 
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="w-24"
            />
          </div>
          <Button onClick={handleGenerate} disabled={loading || !material} className="w-fit">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Generating..." : "Generate Quiz"}
          </Button>

          {generatedQuiz && (
             <div className="grid gap-2">
              <Label>Generated Quiz (Preview)</Label>
              <Textarea readOnly value={generatedQuiz.quiz} rows={10} className="font-mono text-xs bg-muted" />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleSaveQuiz} disabled={!generatedQuiz || !quizTitle}>
            Save Quiz to Topic
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
