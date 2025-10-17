import { useState } from "react";
import { Bot, MessageSquare, FileText, X, Send, Loader2 } from "lucide-react";
import { store } from "@/lib/store";

interface AIAssistantProps {
  projectId: string;
  projectName: string;
}

export function AIAssistant({ projectId }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"summarize" | "ask">("summarize");
  const [summary, setSummary] = useState<string>("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSummarize = async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await store.summarizeProject(projectId);
      setSummary(result);
    } catch (err) {
      setError("Failed to generate summary. Please try again.");
      console.error("Error generating summary:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;

    setIsLoading(true);
    setError("");
    try {
      const result = await store.askQuestion(projectId, question);
      setAnswer(result);
    } catch (err) {
      setError("Failed to get answer. Please try again.");
      console.error("Error asking question:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40"
        title="AI Assistant"
      >
        <Bot size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50">
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Bot className="text-blue-600" size={20} />
          <h3 className="font-semibold text-slate-800">AI Assistant</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-4">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab("summarize")}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "summarize"
                ? "bg-blue-100 text-blue-700"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <FileText size={16} />
            Summarize
          </button>
          <button
            onClick={() => setActiveTab("ask")}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "ask"
                ? "bg-blue-100 text-blue-700"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <MessageSquare size={16} />
            Ask Question
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {activeTab === "summarize" && (
          <div>
            <p className="text-sm text-slate-600 mb-3">
              Get an AI-powered summary of your project progress and tasks.
            </p>
            <button
              onClick={handleSummarize}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText size={16} />
                  Generate Summary
                </>
              )}
            </button>
            {summary && (
              <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                <h4 className="font-medium text-slate-800 mb-2">
                  Project Summary
                </h4>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">
                  {summary}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "ask" && (
          <div>
            <p className="text-sm text-slate-600 mb-3">
              Ask questions about your project tasks and get AI-powered
              insights.
            </p>
            <div className="space-y-3">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question about your project..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
              />
              <button
                onClick={handleAskQuestion}
                disabled={isLoading || !question.trim()}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Thinking...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Ask Question
                  </>
                )}
              </button>
            </div>
            {answer && (
              <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                <h4 className="font-medium text-slate-800 mb-2">Answer</h4>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">
                  {answer}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
