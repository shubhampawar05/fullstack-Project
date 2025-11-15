"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FeedbackFormData, FeedbackResponse } from "@/types/feedback";
import { authenticatedFetch, apiJson } from "@/lib/api-client";
import { getCurrentUser } from "@/lib/auth";
import { Star, Bug, Lightbulb, Sparkles, MessageSquare } from "lucide-react";

const feedbackSchema = z.object({
  type: z.enum(["bug", "feature", "improvement", "other"]),
  subject: z
    .string()
    .min(5, "Subject must be at least 5 characters")
    .max(200, "Subject must be less than 200 characters"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be less than 2000 characters"),
  rating: z.number().min(1).max(5).optional(),
  name: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const feedbackTypes = [
  {
    value: "bug" as const,
    label: "Bug Report",
    icon: Bug,
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-950/20",
  },
  {
    value: "feature" as const,
    label: "Feature Request",
    icon: Sparkles,
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
  },
  {
    value: "improvement" as const,
    label: "Improvement",
    icon: Lightbulb,
    color: "text-yellow-500",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
  },
  {
    value: "other" as const,
    label: "Other",
    icon: MessageSquare,
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
  },
];

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      type: "other" as const,
      subject: "",
      message: "",
      rating: undefined,
      name: "",
      email: "",
    },
  });

  // Try to get user info when dialog opens
  useEffect(() => {
    if (open) {
      getCurrentUser().then((user) => {
        if (user.success && user.user) {
          form.setValue("email", user.user.email);
          if (user.user.name) {
            form.setValue("name", user.user.name);
          }
        }
      });
    }
  }, [open, form]);

  const onSubmit = async (data: FeedbackFormValues) => {
    setIsLoading(true);

    try {
      const feedbackData: FeedbackFormData = {
        type: data.type,
        subject: data.subject,
        message: data.message,
        rating: data.rating,
        name: data.name || undefined,
        email: data.email || undefined,
      };

      // Note: authenticatedFetch already adds API_BASE_URL, so just pass the path
      const response = await authenticatedFetch("/feedback", {
        method: "POST",
        body: JSON.stringify(feedbackData),
      });

      const result = await apiJson<FeedbackResponse>(response);

      if (result.success) {
        toast.success("Feedback Submitted!", {
          description: result.message,
          duration: 4000,
        });
        form.reset();
        onOpenChange(false);
      } else {
        toast.error("Submission Failed", {
          description: result.message,
        });
      }
    } catch (error) {
      console.error("Feedback submission error:", error);
      toast.error("Something went wrong", {
        description:
          error instanceof Error ? error.message : "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <MessageSquare className="h-6 w-6 text-primary" />
            Share Your Feedback
          </DialogTitle>
          <DialogDescription>
            We&apos;d love to hear from you! Your feedback helps us improve.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Feedback Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What type of feedback is this? *</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-3">
                      {feedbackTypes.map((typeOption) => {
                        const Icon = typeOption.icon;
                        return (
                          <button
                            key={typeOption.value}
                            type="button"
                            onClick={() => field.onChange(typeOption.value)}
                            className={`flex items-center gap-3 rounded-lg border-2 p-4 transition-all ${
                              field.value === typeOption.value
                                ? `border-primary ${typeOption.bgColor}`
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <Icon
                              className={`h-5 w-5 ${
                                field.value === typeOption.value
                                  ? typeOption.color
                                  : "text-muted-foreground"
                              }`}
                            />
                            <span className="font-medium">
                              {typeOption.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Rating (Optional) */}
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    How would you rate your experience? (Optional)
                  </FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => field.onChange(rating)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`h-8 w-8 ${
                              field.value && field.value >= rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Subject */}
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Brief summary of your feedback"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Message */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Feedback</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us more about your feedback..."
                      rows={6}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    {field.value?.length || 0} / 2000 characters
                  </p>
                </FormItem>
              )}
            />

            {/* Name (Optional) */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email (Optional) */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Email (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Submitting..." : "Submit Feedback"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
