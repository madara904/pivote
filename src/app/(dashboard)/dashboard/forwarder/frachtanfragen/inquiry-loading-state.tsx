import { DotLoading } from "@/components/ui/dot-loading"

interface InquiryLoadingStateProps {
  text?: string
}

export function InquiryLoadingState({ text = "Lade..." }: InquiryLoadingStateProps) {
  return (
    <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <DotLoading />
          <p className="mt-4 text-muted-foreground">{text}</p>
        </div>
      </div>
    </div>
  )
}
