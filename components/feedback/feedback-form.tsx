/**
 * Feedback Form Component - TalentHR
 * Fixed bottom feedback form for user feedback
 */

"use client";

import { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  IconButton,
  Collapse,
  Alert,
  Rating,
  CircularProgress,
  Chip,
} from "@mui/material";
import { Feedback, Close, Send, CheckCircle } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const feedbackSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
  rating: z.number().min(1).max(5).optional(),
  type: z.enum(["bug", "feature", "general", "other"]).optional(),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

export default function FeedbackForm() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      type: "general",
      rating: 5,
    },
  });

  const rating = watch("rating");

  const onSubmit = async (data: FeedbackFormData) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(
          result.message || "Failed to submit feedback. Please try again."
        );
        setLoading(false);
        return;
      }

      setSubmitted(true);
      reset();
      setLoading(false);

      // Auto-close after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
        setOpen(false);
      }, 3000);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        right: 20,
        zIndex: 1000,
        maxWidth: 400,
        width: "100%",
      }}
    >
      <Collapse in={open}>
        <Paper
          elevation={8}
          sx={{
            p: 3,
            mb: 2,
            borderRadius: 2,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Share Your Feedback
            </Typography>
            <IconButton
              size="small"
              onClick={() => {
                setOpen(false);
                setSubmitted(false);
                setError("");
                reset();
              }}
              sx={{ color: "white" }}
            >
              <Close />
            </IconButton>
          </Box>

          {submitted ? (
            <Box
              sx={{
                textAlign: "center",
                py: 3,
              }}
            >
              <CheckCircle sx={{ fontSize: 48, color: "white", mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                Thank You!
              </Typography>
              <Typography variant="body2">
                Your feedback has been submitted successfully.
              </Typography>
            </Box>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              {error && (
                <Alert
                  severity="error"
                  sx={{ mb: 2, bgcolor: "rgba(255,255,255,0.2)" }}
                >
                  {error}
                </Alert>
              )}

              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  sx={{ mb: 1, color: "rgba(255,255,255,0.9)" }}
                >
                  How would you rate your experience?
                </Typography>
                <Rating
                  value={rating || 5}
                  onChange={(_, newValue) => {
                    setValue("rating", newValue || 5);
                  }}
                  sx={{
                    "& .MuiRating-iconFilled": {
                      color: "white",
                    },
                    "& .MuiRating-iconEmpty": {
                      color: "rgba(255,255,255,0.5)",
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 1.5 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    mb: 0.5,
                    fontSize: "0.875rem",
                    textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                  }}
                >
                  Your Name (Optional)
                </Typography>
                <TextField
                  {...register("name")}
                  placeholder="Enter your name"
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "white",
                      color: "#333",
                      "& fieldset": {
                        borderColor: "rgba(255,255,255,0.5)",
                        borderWidth: 2,
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(255,255,255,0.8)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "white",
                        borderWidth: 2,
                      },
                      "& input": {
                        color: "#333",
                        "&::placeholder": {
                          color: "#999",
                          opacity: 1,
                        },
                      },
                    },
                    "& .MuiFormHelperText-root": {
                      color: "rgba(255,255,255,0.9)",
                      fontSize: "0.75rem",
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 1.5 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    mb: 0.5,
                    fontSize: "0.875rem",
                    textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                  }}
                >
                  Your Email (Optional)
                </Typography>
                <TextField
                  {...register("email")}
                  placeholder="Enter your email"
                  type="email"
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "white",
                      color: "#333",
                      "& fieldset": {
                        borderColor: "rgba(255,255,255,0.5)",
                        borderWidth: 2,
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(255,255,255,0.8)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "white",
                        borderWidth: 2,
                      },
                      "& input": {
                        color: "#333",
                        "&::placeholder": {
                          color: "#999",
                          opacity: 1,
                        },
                      },
                    },
                    "& .MuiFormHelperText-root": {
                      color: "rgba(255,255,255,0.9)",
                      fontSize: "0.75rem",
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 1.5 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    mb: 0.5,
                    fontSize: "0.875rem",
                    textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                  }}
                >
                  Your Feedback <span style={{ color: "#ffeb3b" }}>*</span>
                </Typography>
                <TextField
                  {...register("message")}
                  placeholder="Tell us what you think..."
                  multiline
                  rows={4}
                  fullWidth
                  required
                  error={!!errors.message}
                  helperText={errors.message?.message}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "white",
                      color: "#333",
                      "& fieldset": {
                        borderColor: "rgba(255,255,255,0.5)",
                        borderWidth: 2,
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(255,255,255,0.8)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "white",
                        borderWidth: 2,
                      },
                      "& textarea": {
                        color: "#333",
                        "&::placeholder": {
                          color: "#999",
                          opacity: 1,
                        },
                      },
                    },
                    "& .MuiFormHelperText-root": {
                      color: "rgba(255,255,255,0.9)",
                      fontSize: "0.75rem",
                    },
                  }}
                />
              </Box>

              <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
                {["bug", "feature", "general", "other"].map((type) => (
                  <Chip
                    key={type}
                    label={type.charAt(0).toUpperCase() + type.slice(1)}
                    onClick={() => setValue("type", type as any)}
                    sx={{
                      bgcolor:
                        watch("type") === type
                          ? "rgba(255,255,255,0.3)"
                          : "rgba(255,255,255,0.1)",
                      color: "white",
                      "&:hover": {
                        bgcolor: "rgba(255,255,255,0.2)",
                      },
                    }}
                  />
                ))}
              </Box>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                sx={{
                  mt: 2,
                  bgcolor: "white",
                  color: "#667eea",
                  fontWeight: 600,
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.9)",
                  },
                }}
              >
                {loading ? "Submitting..." : "Submit Feedback"}
              </Button>
            </form>
          )}
        </Paper>
      </Collapse>

      {!open && (
        <Button
          variant="contained"
          startIcon={<Feedback />}
          onClick={() => setOpen(true)}
          sx={{
            bgcolor: "primary.main",
            color: "white",
            borderRadius: "20px 20px 0 0",
            px: 3,
            py: 1.5,
            textTransform: "none",
            fontWeight: 600,
            boxShadow: 4,
            "&:hover": {
              bgcolor: "primary.dark",
              boxShadow: 6,
            },
          }}
        >
          Feedback
        </Button>
      )}
    </Box>
  );
}
