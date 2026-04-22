import localFont from "next/font/local";
import { Space_Grotesk } from "next/font/google";

export const sans = localFont({
  variable: "--font-sans",
  display: "swap",
  src: "./cofosansvf.ttf",
  weight: "100 900",
});

export const mono = localFont({
  variable: "--font-mono",
  display: "swap",
  src: "./cofosansmonovf.ttf",
  weight: "100 900",
});

export const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});
