import type { Metadata } from "next";
import { MemoryAppLoginDemo } from "./memory-app-demo";

export const metadata: Metadata = {
  title: "Memory App",
  description: "Connect ChatGPT data to Memory App.",
};

export default function LoginWithVanaDemoPage() {
  return <MemoryAppLoginDemo />;
}
