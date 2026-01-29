import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getYouTubeEmbedUrl, EDUFLOW_INTRO_VIDEO_ID } from "@/utils/youtubeUtils";

interface IntroVideoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IntroVideoDialog({ open, onOpenChange }: IntroVideoDialogProps) {
  const embedUrl = getYouTubeEmbedUrl(EDUFLOW_INTRO_VIDEO_ID);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>EduFlow Platform Overview</DialogTitle>
        </DialogHeader>
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={open ? `${embedUrl}&autoplay=1` : embedUrl}
            title="EduFlow Introduction Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
