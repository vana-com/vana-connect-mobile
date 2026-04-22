"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDemoStore } from "@/hooks/use-demo-store";
import { cn } from "@/lib/utils";
import { Walk1 } from "./_scenes/Walk1";
import { Walk2 } from "./_scenes/Walk2";
import { Walk3 } from "./_scenes/Walk3";

type Step = "walk1" | "walk2" | "walk3" | "signup" | "otp";
type AuthMode = "email" | "phone";

export default function OnboardingPage() {
  const router    = useRouter();
  const setEmail  = useDemoStore((s) => s.setEmail);
  const [step, setStep]     = useState<Step>("walk1");
  const [mode, setMode]     = useState<AuthMode>("email");
  const [value, setValue]   = useState("");
  const [otp, setOtp]       = useState("");
  const [loading, setLoading] = useState(false);

  function advance() {
    if (step === "walk1") setStep("walk2");
    else if (step === "walk2") setStep("walk3");
    else setStep("signup");
  }

  function handleSignup() { setStep("otp"); }

  async function handleVerifyOtp() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setEmail(value);
    router.push("/memory");
  }

  if (step === "walk1") return <Walk1 onNext={advance} onSkip={() => setStep("signup")} />;
  if (step === "walk2") return <Walk2 onNext={advance} onSkip={() => setStep("signup")} />;
  if (step === "walk3") return <Walk3 onGetStarted={() => setStep("signup")} />;

  /* Signup / OTP steps */
  return (
    <div className="relative min-h-screen overflow-hidden bg-newsprint">
      {/* Red Kruger bar header */}
      <div
        className="bg-sticker-red px-inset"
        style={{ paddingTop: "max(env(safe-area-inset-top), 16px)", paddingBottom: 12 }}
      >
        <span
          className="font-display font-black uppercase [color:var(--background)] leading-tight"
          style={{ fontSize: "clamp(22px, 6vw, 32px)", letterSpacing: "-0.02em" }}
        >
          {step === "otp" ? "CHECK YOUR INBOX." : "CREATE YOUR ACCOUNT."}
        </span>
      </div>

      <div className="px-inset pt-8">
        <p className="font-mono text-small text-muted-foreground uppercase tracking-wide mb-8">
          {step === "otp"
            ? `Code sent to ${value}.`
            : "No password. Just a quick code."}
        </p>

        {step === "signup" && (
          <>
            {/* Email / Phone toggle */}
            <div className="flex border-[3px] border-real-black mb-4 shadow-hard-sm">
              {(["email", "phone"] as AuthMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setValue(""); }}
                  className={cn(
                    "flex-1 py-3 font-mono text-small font-bold uppercase tracking-wide transition-colors",
                    mode === m
                      ? "bg-foreground [color:var(--background)]"
                      : "bg-background text-muted-foreground hover:bg-muted"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
            <Input
              type={mode === "email" ? "email" : "tel"}
              placeholder={mode === "email" ? "you@example.com" : "+1 555 000 0000"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="mb-4 font-mono uppercase tracking-wide"
              autoFocus
            />
          </>
        )}

        {step === "otp" && (
          <Input
            type="text"
            inputMode="numeric"
            placeholder="000000"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            className="mb-4 text-center text-heading font-mono tracking-[0.3em]"
            autoFocus
          />
        )}

        <Button
          fullWidth
          onClick={step === "signup" ? handleSignup : handleVerifyOtp}
          disabled={loading || (step === "signup" ? !value : otp.length < 6)}
        >
          {loading ? "..." : step === "signup" ? "SEND CODE" : "VERIFY"}
        </Button>

        {step === "otp" && (
          <button
            onClick={() => { setStep("signup"); setOtp(""); }}
            className="mt-6 w-full text-center font-mono text-small text-muted-foreground uppercase tracking-wide underline underline-offset-2"
          >
            Use a different address
          </button>
        )}
      </div>
    </div>
  );
}
