export interface FeedbackFormData {
  type: "bug" | "feature" | "improvement" | "other";
  subject: string;
  message: string;
  rating?: number;
  name?: string;
  email?: string;
}

export interface FeedbackResponse {
  success: boolean;
  message: string;
  feedbackId?: string;
}
