"use client"

import { User } from '@supabase/supabase-js'
import React, { Fragment, useRef, useState, useTransition, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from './ui/button'
import { useRouter } from 'next/navigation'
import { Textarea } from './ui/textarea'
import { ArrowUpIcon, Sparkles } from 'lucide-react' // Added Sparkles for flavor
import { cn } from '@/lib/utils' // Assuming you have a cn utility, if not, standard template literals work
import { askAIAboutNotesAction } from '@/actions/notes'
import ReactMarkdown from 'react-markdown';

type Props = {
  user: User | null,
}

function AskAIButton({ user }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [responses, setResponses] = useState<string[]>([]);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleOpenChange = (isOpen: boolean) => {
    if (!user) {
      router.push("/login");
    } else {
      if (isOpen) {
        // setQuestionText("");
        // setQuestions([]);
        // setResponses([]);
      }
      setOpen(isOpen);
    }
  }

  const handleInput = () => {
    const textarea = textAreaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [questions, responses, isPending]);

  const handleSubmit = () => {
    if (!questionText.trim()) return;

    const newQuestions = [...questions, questionText];
    setQuestions(newQuestions);
    setQuestionText("");
    
    if(textAreaRef.current) textAreaRef.current.style.height = "auto";

    startTransition(async () => {
      const response = await askAIAboutNotesAction(newQuestions, responses);
      if (typeof response === 'string') {
        setResponses((prev) => [...prev, response]);
      } else {
        setResponses((prev) => [...prev, "<p>I am unable to generate response</p>"]);
      }
    });
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
           <Sparkles className="size-4 text-purple-500" />
           Ask AI
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-200 h-[80vh] flex flex-col p-0 gap-0">
        
        {/* Header Section */}
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            Ask AI
          </DialogTitle>
          <DialogDescription>
            Ask generic questions or specific details about your notes.
          </DialogDescription>
        </DialogHeader>

        <div 
          ref={scrollAreaRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
        >
          {questions.length === 0 && (
             <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                <p>No messages yet.</p>
                <p className="text-xs">Start the conversation below!</p>
             </div>
          )}

          {questions.map((question, index) => (
            <Fragment key={index}>
              {/* User Message */}
              <div className="flex justify-end">
                <div className="bg-primary text-primary-foreground px-4 py-2 rounded-2xl rounded-tr-sm max-w-[80%] text-sm shadow-sm">
                  {question}
                </div>
              </div>

              {/* AI Response */}
              {responses[index] && (
                <div className="flex justify-start">
                   <div 
                     className="bg-muted text-foreground px-4 py-2 rounded-2xl rounded-tl-sm max-w-[85%] text-sm leading-relaxed"  
                   >
                   <ReactMarkdown
                      components={{
                        // Optional: Custom styling for specific markdown elements
                        ul: ({node, ...props}) => <ul className="list-disc ml-4" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal ml-4" {...props} />,
                        strong: ({node, ...props}) => <span className="font-bold text-foreground" {...props} />,
                        blockquote: ({node, ...props}) => <span className="border-l-0 pl-0" {...props} />
                      }}
                    >
                      {responses[index]}
                    </ReactMarkdown>
                    </div>
                </div>
              )}
            </Fragment>
          ))}
          
          {isPending && (
             <div className="flex justify-start">
                <div className="bg-muted px-4 py-2 rounded-2xl rounded-tl-sm text-xs animate-pulse">
                   AI is thinking...
                </div>
             </div>
          )}
        </div>

        {/* 3. Input Area */}
        <div className="p-4 border-t bg-background">
          <div className="relative flex items-end border rounded-xl shadow-sm focus-within:ring-1 focus-within:ring-ring">
            <Textarea
              ref={textAreaRef}
              rows={1}
              className="min-h-12.5 w-full resize-none border-0 bg-transparent py-4 pl-4 pr-12 focus-visible:ring-0 shadow-none scrollbar-hide"
              placeholder="Ask a question..."
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
            />
            
            <Button 
              size="icon"
              disabled={!questionText.trim() || isPending}
              onClick={handleSubmit}
              className="absolute bottom-2 right-2 size-8 rounded-lg shrink-0"
            >
              <ArrowUpIcon className="size-4" />
            </Button>
          </div>
          <p className="text-[10px] text-center text-muted-foreground mt-2">
             AI can make mistakes. Please verify important information.
          </p>
        </div>

      </DialogContent>
    </Dialog>
  )
}

export default AskAIButton