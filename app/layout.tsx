import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import FeedbackForm from "@/components/feedback/feedback-form";

export const metadata: Metadata = {
  title: "TalentHR - Human Resources Management System",
  description: "Comprehensive HRMS for managing your workforce",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <FeedbackForm />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
