import type { Metadata } from "next";
import { VanaWebPoc } from "./vana-web-poc";

export const metadata: Metadata = {
  title: "Vana Web POC",
  description: "Seed ChatGPT demo data and hand off to the Builder App.",
};

export default function VanaWebPocPage() {
  return <VanaWebPoc />;
}
