import type { Metadata, Viewport } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { display, sans, mono } from "@/fonts/fonts";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "Vana Connect",
  description: "Your data, organized. Every app asks first.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={cn(sans.variable, mono.variable, display.variable, "viewport-wrapper")}>
        {children}
        {/* Squircle clip paths for iOS app icon masking */}
        <svg aria-hidden="true" width="0" height="0" style={{ position: "absolute" }}>
          <defs>
            <clipPath id="squircle-ios" clipPathUnits="objectBoundingBox">
              <path d="M0.5,0 C0.784,0 1,0.216 1,0.5 C1,0.784 0.784,1 0.5,1 C0.216,1 0,0.784 0,0.5 C0,0.216 0.216,0 0.5,0 Z" />
            </clipPath>
          </defs>
        </svg>
      </body>
    </html>
  );
}
