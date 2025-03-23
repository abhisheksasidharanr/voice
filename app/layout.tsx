import type { ReactNode } from "react";
import { Inter, Fira_Code } from "next/font/google";
import localFont from "next/font/local";
import { DeepgramContextProvider } from "./context/DeepgramContextProvider";
import { MicrophoneContextProvider } from "./context/MicrophoneContextProvider";
import { VoiceBotProvider } from "./context/VoiceBotContextProvider";
import dynamic from 'next/dynamic';

import "./globals.css";
import { sharedOpenGraphMetadata } from "./lib/constants";

const AnimatedBackground = dynamic(() => import('./components/AnimatedBackground'), {
  ssr: false
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "fallback",
});
const fira = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira",
  display: "fallback",
});
const favorit = localFont({
  src: "./fonts/ABCFavorit-Bold.woff2",
  weight: "700",
  variable: "--font-favorit",
  display: "fallback",
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_PATH || "http://localhost:3000"),
  title: "Voice Agent | Deepgram",
  description: "Meet Deepgram's Voice Agent API",
  openGraph: sharedOpenGraphMetadata,
  twitter: {
    card: "summary_large_image",
    site: "@DeepgramAI",
    creator: "@DeepgramAI",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fira.variable} ${favorit.variable}`}>
      <body>
        <DeepgramContextProvider>
          <MicrophoneContextProvider>
            <VoiceBotProvider>
              <AnimatedBackground>
                {children}
              </AnimatedBackground>
            </VoiceBotProvider>
          </MicrophoneContextProvider>
        </DeepgramContextProvider>
      </body>
    </html>
  );
}
