import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { summarizeProject, askQuestion } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AIAssistantProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

export function AIAssistant({
  open,
  onOpenChange,
  projectId,
}: AIAssistantProps) {
  const [question, setQuestion] = useState("");
  const [summary, setSummary] = useState("");
  const [answer, setAnswer] = useState("");

  const summarizeMutation = useMutation({
    mutationFn: () => summarizeProject(projectId),
    onSuccess: (data) => {
      setSummary(data.summary);
      setAnswer("");
    },
    onError: () => {
      toast.error("Failed to generate summary");
    },
  });

  const askMutation = useMutation({
    mutationFn: (q: string) => askQuestion(projectId, q),
    onSuccess: (data) => {
      setAnswer(data.answer);
      setSummary("");
    },
    onError: () => {
      toast.error("Failed to get answer");
    },
  });

  const handleSummarize = () => {
    summarizeMutation.mutate();
  };

  const handleAsk = () => {
    if (!question.trim()) {
      toast.error("Please enter a question");
      return;
    }
    askMutation.mutate(question);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Assistant
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Get AI-powered insights about your project
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          <div>
            <Button
              onClick={handleSummarize}
              disabled={summarizeMutation.isPending}
              className="w-full text-sm sm:text-base"
            >
              {summarizeMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Summary...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Summarize All Tasks
                </>
              )}
            </Button>
          </div>

          <div className="space-y-2">
            <Textarea
              placeholder="Ask a question about your tasks..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              className="text-base resize-none"
            />
            <Button
              onClick={handleAsk}
              disabled={askMutation.isPending}
              className="w-full text-sm sm:text-base"
            >
              {askMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Getting Answer...
                </>
              ) : (
                "Ask Question"
              )}
            </Button>
          </div>

          {(summary || answer) && (
            <div className="bg-accent/50 rounded-lg p-3 sm:p-4 space-y-2">
              <h4 className="font-semibold text-sm sm:text-base">
                {summary ? "Summary" : "Answer"}
              </h4>
              <p className="text-sm sm:text-base leading-relaxed">
                {summary || answer}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
