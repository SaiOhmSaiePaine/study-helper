import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Study Helper - AI-Powered Learning Assistant",
  description: "An open-source study helper that helps you learn from your documents with AI-powered notes, flashcards, and quizzes.",
  applicationName: "Study Helper",
  authors: [{ name: "Study Helper Team" }],
  keywords: ["study", "learning", "AI", "education", "notes", "flashcards", "quiz"],
  viewport: "width=device-width, initial-scale=1",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <main 
          className="min-h-screen bg-gray-50"
          role="main"
          aria-label="Study Helper Application"
        >
          {children}
        </main>
      </body>
    </html>
  );
}
