import { useState, useCallback } from "react";
import { uploadMedia, deleteMedia } from "@/lib/mediaStorage";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ImagePlus, X, Loader2, FileText } from "lucide-react";

interface WelcomeMediaUploadProps {
  mediaUrls: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
}

export default function WelcomeMediaUpload({ mediaUrls, onChange, maxFiles = 7 }: WelcomeMediaUploadProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;

    const remaining = maxFiles - mediaUrls.length;
    if (remaining <= 0) {
      toast({ title: "Media limit reached", description: `Maximum ${maxFiles} files allowed.`, variant: "destructive" });
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remaining);
    setUploading(true);

    try {
      const uploaded: string[] = [];
      for (const file of filesToUpload) {
        const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
        if (!file.type.startsWith("image/") && !file.type.startsWith("video/") && !file.type.startsWith("audio/") && !isPdf) {
          toast({ title: "Invalid file type", description: `${file.name} is not an image, video, audio, or PDF file.`, variant: "destructive" });
          continue;
        }
        if (file.size > 10 * 1024 * 1024) {
          toast({ title: "File too large", description: `${file.name} exceeds 10MB limit.`, variant: "destructive" });
          continue;
        }

        uploaded.push(await uploadMedia(file, "welcome"));
      }
      onChange([...mediaUrls, ...uploaded]);
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }, [user, mediaUrls, maxFiles, onChange, toast]);

  const removeMedia = useCallback(async (url: string) => {
    await deleteMedia(url);
    onChange(mediaUrls.filter((u) => u !== url));
  }, [mediaUrls, onChange]);

  const isVideo = (url: string) => /\.(mp4|mov|avi|webm)$/i.test(url);
  const isAudio = (url: string) => /\.(mp3|wav|ogg|m4a|aac|opus)$/i.test(url);
  const isPdf = (url: string) => /\.pdf$/i.test(url.split("?")[0]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Welcome Media</Label>
        <span className="text-xs text-muted-foreground">
          {mediaUrls.length}/{maxFiles}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        Upload images, videos, voice files, or PDFs to send with the welcome message when a new customer contacts you
      </p>
      <p className="text-xs text-muted-foreground">
        Supported: JPG, PNG, WebP, MP4, MP3, WAV, OGG, M4A, PDF
      </p>

      <div className="flex flex-wrap gap-3">
        {mediaUrls.map((url) => (
          <div key={url} className="relative group w-20 h-20 rounded-md overflow-hidden border border-border">
            {isVideo(url) ? (
              <video src={url} className="w-full h-full object-cover" muted />
            ) : isAudio(url) ? (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <span className="text-lg">🎵</span>
              </div>
            ) : isPdf(url) ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-0.5 bg-muted p-1 text-muted-foreground">
                <FileText className="h-5 w-5" />
                <span className="text-[9px] text-center break-all line-clamp-2">
                  {decodeURIComponent(url.split("/").pop()?.split("?")[0] || "file.pdf")}
                </span>
              </div>
            ) : (
              <img src={url} alt="Welcome media" className="w-full h-full object-cover" />
            )}
            <button
              type="button"
              onClick={() => removeMedia(url)}
              className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {mediaUrls.length < maxFiles && (
          <label className="w-20 h-20 rounded-md border-2 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <ImagePlus className="h-5 w-5 text-muted-foreground" />
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,video/mp4,audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/aac,application/pdf,.pdf"
              multiple
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        )}
      </div>
    </div>
  );
}
