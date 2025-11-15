"use client";

import { MessageSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeedbackDialog } from "./feedback-dialog";
import { useState } from "react";

export function FeedbackButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setOpen(true)}
          size="lg"
          className="group relative h-14 w-14 rounded-full shadow-lg transition-all hover:scale-110 hover:shadow-xl"
          aria-label="Send Feedback"
        >
          <MessageSquare className="h-6 w-6 transition-transform group-hover:scale-110" />
          <Sparkles className="absolute -top-1 -right-1 h-4 w-4 animate-pulse text-yellow-400" />
        </Button>
      </div>
      <FeedbackDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
