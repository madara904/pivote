import { DotLoading } from "@/components/ui/dot-loading";

interface InquiryLoadingStateProps {
  text: string;
}

export function InquiryLoadingState( { text }: InquiryLoadingStateProps ) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="text-center space-y-2 w-full max-w-sm">
          <div className="flex justify-center">
            <DotLoading size="md" />
          </div>
          <p className="text-center py-8 text-muted-foreground">
            {text}
          </p>
        </div>
      </div>
    );
  }