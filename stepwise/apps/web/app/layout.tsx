import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "@/components/challenge/challenge-viewer.css";
import "@/components/challenge/step-content.css";
import NavBar from "@/components/NavBar";
import { Providers } from "@/components/Providers";

const geist = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "StepWise — Discover by Doing",
  description: "StepWise is a quest-based guided exploration platform. Build real projects in your local environment, step by step — no browser sandboxes, no hand-holding.",
  keywords: ["guided exploration", "local development", "JavaScript quests", "TypeScript", "developer skills", "CLI learning"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body>
        <Providers>
          <NavBar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
