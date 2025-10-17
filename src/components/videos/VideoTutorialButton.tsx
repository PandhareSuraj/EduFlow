import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";
import { useVideoTutorial } from "@/hooks/useVideoTutorial";
import { VideoTutorialDialog } from "./VideoTutorialDialog";

interface VideoTutorialButtonProps {
  pageIdentifier: string;
  pageName: string;
  variant?: "default" | "outline" | "ghost";
}

/**
 * Button component that displays tutorial video for a specific page
 * Automatically shows/hides based on video availability
 */
export function VideoTutorialButton({
  pageIdentifier,
  pageName,
  variant = "outline",
}: VideoTutorialButtonProps) {
  const { video, loading } = useVideoTutorial(pageIdentifier);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Don't render button if no video or still loading
  if (loading || !video) {
    return null;
  }

  return (
    <>
      <Button
        variant={variant}
        size="sm"
        onClick={() => setDialogOpen(true)}
        className="gap-2"
      >
        <PlayCircle className="h-4 w-4" />
        Watch how to use {pageName}
      </Button>

      <VideoTutorialDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        videoId={video.video_id}
        videoTitle={video.page_title}
        description={video.description}
      />
    </>
  );
}
