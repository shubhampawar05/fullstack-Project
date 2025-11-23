/**
 * Employee Survey Component - Premium UI
 * Features: Question types, progress tracking, anonymous responses
 */

"use client";

import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Checkbox,
  TextField,
  Rating,
  LinearProgress,
  Chip,
  IconButton,
} from "@mui/material";
import {
  ArrowBack,
  ArrowForward,
  Send,
  CheckCircle,
  Star,
} from "@mui/icons-material";

interface SurveyQuestion {
  id: string;
  type: "single-choice" | "multiple-choice" | "text" | "rating" | "scale";
  question: string;
  options?: string[];
  required: boolean;
}

interface SurveyData {
  title: string;
  description: string;
  questions: SurveyQuestion[];
  isAnonymous: boolean;
}

interface EmployeeSurveyProps {
  survey: SurveyData;
  onSubmit?: (responses: Record<string, any>) => void;
}

export default function EmployeeSurvey({ survey, onSubmit }: EmployeeSurveyProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);

  const question = survey.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / survey.questions.length) * 100;
  const isLastQuestion = currentQuestion === survey.questions.length - 1;
  const canProceed = !question.required || responses[question.id] !== undefined;

  const handleNext = () => {
    if (currentQuestion < survey.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit?.(responses);
    setSubmitted(true);
  };

  const handleResponse = (value: any) => {
    setResponses({ ...responses, [question.id]: value });
  };

  const renderQuestion = () => {
    switch (question.type) {
      case "single-choice":
        return (
          <FormControl fullWidth>
            <RadioGroup
              value={responses[question.id] || ""}
              onChange={(e) => handleResponse(e.target.value)}
            >
              {question.options?.map((option, idx) => (
                <FormControlLabel
                  key={idx}
                  value={option}
                  control={<Radio />}
                  label={option}
                  sx={{
                    mb: 1,
                    p: 2,
                    borderRadius: 2,
                    border: "1px solid rgba(0,0,0,0.08)",
                    bgcolor: responses[question.id] === option ? "rgba(102, 126, 234, 0.05)" : "transparent",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: "rgba(102, 126, 234, 0.05)",
                    },
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );

      case "multiple-choice":
        return (
          <FormControl fullWidth>
            {question.options?.map((option, idx) => (
              <FormControlLabel
                key={idx}
                control={
                  <Checkbox
                    checked={responses[question.id]?.includes(option) || false}
                    onChange={(e) => {
                      const current = responses[question.id] || [];
                      const updated = e.target.checked
                        ? [...current, option]
                        : current.filter((item: string) => item !== option);
                      handleResponse(updated);
                    }}
                  />
                }
                label={option}
                sx={{
                  mb: 1,
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid rgba(0,0,0,0.08)",
                  bgcolor: responses[question.id]?.includes(option)
                    ? "rgba(102, 126, 234, 0.05)"
                    : "transparent",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: "rgba(102, 126, 234, 0.05)",
                  },
                }}
              />
            ))}
          </FormControl>
        );

      case "text":
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Type your answer here..."
            value={responses[question.id] || ""}
            onChange={(e) => handleResponse(e.target.value)}
            sx={{ borderRadius: 2 }}
          />
        );

      case "rating":
        return (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <Rating
              value={responses[question.id] || 0}
              onChange={(_, value) => handleResponse(value)}
              size="large"
              sx={{ fontSize: "3rem" }}
            />
            <Typography variant="caption" color="text.secondary" display="block" mt={2}>
              {responses[question.id] ? `${responses[question.id]} out of 5` : "Select a rating"}
            </Typography>
          </Box>
        );

      case "scale":
        return (
          <Box sx={{ py: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <Box
                  key={num}
                  onClick={() => handleResponse(num)}
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    border: "2px solid",
                    borderColor: responses[question.id] === num ? "#667eea" : "rgba(0,0,0,0.1)",
                    bgcolor: responses[question.id] === num ? "#667eea" : "transparent",
                    color: responses[question.id] === num ? "white" : "text.primary",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: "#667eea",
                      transform: "scale(1.1)",
                    },
                  }}
                >
                  {num}
                </Box>
              ))}
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="caption" color="text.secondary">
                Not at all likely
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Extremely likely
              </Typography>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  if (submitted) {
    return (
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          border: "1px solid rgba(255,255,255,0.6)",
          background: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(12px)",
          maxWidth: 600,
          mx: "auto",
        }}
      >
        <CardContent sx={{ p: 5, textAlign: "center" }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
            }}
          >
            <CheckCircle sx={{ fontSize: 48, color: "white" }} />
          </Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Thank You! 🎉
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Your response has been submitted successfully.
            {survey.isAnonymous && " Your feedback is anonymous."}
          </Typography>
          <Button
            variant="contained"
            sx={{
              borderRadius: 2,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
            }}
          >
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        border: "1px solid rgba(255,255,255,0.6)",
        background: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(12px)",
        maxWidth: 800,
        mx: "auto",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          p: 4,
          borderRadius: "16px 16px 0 0",
        }}
      >
        <Typography variant="h4" fontWeight={700} gutterBottom>
          {survey.title}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
          {survey.description}
        </Typography>
        {survey.isAnonymous && (
          <Chip
            label="Anonymous Survey"
            size="small"
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              color: "white",
              fontWeight: 600,
              backdropFilter: "blur(10px)",
            }}
          />
        )}
      </Box>

      {/* Progress */}
      <Box sx={{ px: 4, pt: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Question {currentQuestion + 1} of {survey.questions.length}
          </Typography>
          <Typography variant="caption" fontWeight={700} sx={{ color: "#667eea" }}>
            {progress.toFixed(0)}% Complete
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: "rgba(0,0,0,0.05)",
            "& .MuiLinearProgress-bar": {
              borderRadius: 4,
              background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
            },
          }}
        />
      </Box>

      <CardContent sx={{ p: 4 }}>
        {/* Question */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            {question.question}
            {question.required && (
              <Typography component="span" sx={{ color: "#ef4444", ml: 1 }}>
                *
              </Typography>
            )}
          </Typography>
        </Box>

        {/* Answer Input */}
        {renderQuestion()}

        {/* Navigation */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            sx={{ borderRadius: 2 }}
          >
            Previous
          </Button>
          {isLastQuestion ? (
            <Button
              variant="contained"
              endIcon={<Send />}
              onClick={handleSubmit}
              disabled={!canProceed}
              sx={{
                borderRadius: 2,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
              }}
            >
              Submit Survey
            </Button>
          ) : (
            <Button
              variant="contained"
              endIcon={<ArrowForward />}
              onClick={handleNext}
              disabled={!canProceed}
              sx={{
                borderRadius: 2,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
              }}
            >
              Next
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
