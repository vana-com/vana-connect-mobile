import { cn } from "@/lib/utils";

interface PhoneFrameProps {
  children: React.ReactNode;
  className?: string;
}

export function PhoneFrame({ children, className }: PhoneFrameProps) {
  return (
    <div
      className={cn(
        "min-h-screen w-full bg-background",
        "sm:flex sm:items-center sm:justify-center sm:min-h-screen sm:p-8",
        "sm:bg-real-black",
        className
      )}
    >
      <div
        className={cn(
          "relative w-full min-h-screen bg-background overflow-hidden",
          "sm:w-[390px] sm:min-h-0 sm:h-[844px]",
          "sm:border-[4px] sm:border-newsprint",
          "sm:shadow-[12px_12px_0_#E63946]",
        )}
      >
        {children}
      </div>
    </div>
  );
}
