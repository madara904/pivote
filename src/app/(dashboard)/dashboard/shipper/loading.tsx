import { LogoLoader } from "@/components/ui/loader";


export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="flex flex-col items-center justify-center w-full h-full">
        <LogoLoader size={64} color="var(--primary)" />
      </div>
    </div>
  );
} 