import { LogoLoader } from "@/components/ui/loader";


export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <LogoLoader size={64} color="var(--primary)" />
    </div>
  );
} 