import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { extractYouTubeVideoId, getYouTubeThumbnailUrl, isValidYouTubeUrl } from "@/utils/youtubeUtils";

interface TutorialVideo {
  id: string;
  page_identifier: string;
  page_title: string;
  video_url: string;
  video_id: string;
  description: string | null;
  is_active: boolean;
}

const AVAILABLE_PAGES = [
  { id: "dashboard", title: "Dashboard" },
  { id: "students", title: "Student Management" },
  { id: "fees", title: "Fee Management" },
  { id: "attendance", title: "Attendance Tracking" },
  { id: "library", title: "Library Management" },
  { id: "exams", title: "Exam Management" },
  { id: "faculty", title: "Faculty Management" },
  { id: "courses", title: "Course Management" },
  { id: "hostel", title: "Hostel Management" },
  { id: "transport", title: "Transport Management" },
  { id: "inventory", title: "Inventory Management" },
  { id: "id_cards", title: "ID Card Generation" },
  { id: "reports", title: "Reports & Analytics" },
  { id: "placements", title: "Placement Management" },
  { id: "student_dashboard", title: "Student Portal" },
];

export function VideoManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<TutorialVideo | null>(null);
  const [formData, setFormData] = useState({
    page_identifier: "",
    page_title: "",
    video_url: "",
    description: "",
    is_active: true,
  });
  const [videoIdPreview, setVideoIdPreview] = useState<string | null>(null);

  // Fetch all videos
  const { data: videos, isLoading } = useQuery({
    queryKey: ['tutorial-videos-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tutorial_videos')
        .select('*')
        .order('page_title');
      if (error) throw error;
      return data as TutorialVideo[];
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const videoId = extractYouTubeVideoId(data.video_url);
      if (!videoId) {
        throw new Error("Invalid YouTube URL");
      }

      const videoData = {
        page_identifier: data.page_identifier,
        page_title: data.page_title,
        video_url: data.video_url,
        video_id: videoId,
        description: data.description || null,
        is_active: data.is_active,
      };

      if (editingVideo) {
        const { error } = await supabase
          .from('tutorial_videos')
          .update(videoData)
          .eq('id', editingVideo.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tutorial_videos')
          .insert(videoData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutorial-videos-all'] });
      queryClient.invalidateQueries({ queryKey: ['tutorial-video'] });
      toast({
        title: "Success",
        description: `Tutorial video ${editingVideo ? 'updated' : 'created'} successfully`,
      });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save tutorial video",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tutorial_videos')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutorial-videos-all'] });
      queryClient.invalidateQueries({ queryKey: ['tutorial-video'] });
      toast({
        title: "Success",
        description: "Tutorial video deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete tutorial video",
        variant: "destructive",
      });
    },
  });

  const handleOpenDialog = (video?: TutorialVideo) => {
    if (video) {
      setEditingVideo(video);
      setFormData({
        page_identifier: video.page_identifier,
        page_title: video.page_title,
        video_url: video.video_url,
        description: video.description || "",
        is_active: video.is_active,
      });
      setVideoIdPreview(video.video_id);
    } else {
      setEditingVideo(null);
      setFormData({
        page_identifier: "",
        page_title: "",
        video_url: "",
        description: "",
        is_active: true,
      });
      setVideoIdPreview(null);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingVideo(null);
    setFormData({
      page_identifier: "",
      page_title: "",
      video_url: "",
      description: "",
      is_active: true,
    });
    setVideoIdPreview(null);
  };

  const handleUrlChange = (url: string) => {
    setFormData({ ...formData, video_url: url });
    if (isValidYouTubeUrl(url)) {
      const videoId = extractYouTubeVideoId(url);
      setVideoIdPreview(videoId);
    } else {
      setVideoIdPreview(null);
    }
  };

  const handlePageSelect = (pageId: string) => {
    const page = AVAILABLE_PAGES.find(p => p.id === pageId);
    if (page) {
      setFormData({
        ...formData,
        page_identifier: page.id,
        page_title: page.title,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.page_identifier || !formData.page_title || !formData.video_url) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    if (!isValidYouTubeUrl(formData.video_url)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid YouTube URL",
        variant: "destructive",
      });
      return;
    }
    saveMutation.mutate(formData);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Tutorial Video Management</h2>
          <p className="text-muted-foreground">Manage page-specific tutorial videos for users</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Video
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Page</TableHead>
              <TableHead>Video Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Preview</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : videos && videos.length > 0 ? (
              videos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell className="font-medium">{video.page_title}</TableCell>
                  <TableCell className="max-w-xs truncate">{video.video_url}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      video.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {video.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <a
                      href={video.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View
                    </a>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(video)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(video.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No tutorial videos configured yet. Click "Add New Video" to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingVideo ? 'Edit Tutorial Video' : 'Add New Tutorial Video'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="page">Page *</Label>
                <Select
                  value={formData.page_identifier}
                  onValueChange={handlePageSelect}
                  disabled={!!editingVideo}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a page" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_PAGES.map((page) => (
                      <SelectItem key={page.id} value={page.id}>
                        {page.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="video_url">YouTube URL *</Label>
                <Input
                  id="video_url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={formData.video_url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  required
                />
                {videoIdPreview && (
                  <div className="mt-2">
                    <img
                      src={getYouTubeThumbnailUrl(videoIdPreview)}
                      alt="Video thumbnail"
                      className="w-full max-w-xs rounded border"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of what this video covers..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving...' : editingVideo ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
