import { useEffect, useState } from "react";
import fileIcon from "../assets/file.svg";

interface FilePreviewProps {
  file: File | null;
}

export function FilePreview({ file }: FilePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null); 
      return;
    }

    if (file.type === "application/pdf") {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  if (!file) return null; 

  if (file.type === "application/pdf" && previewUrl) {
    return (
      <div className="space-y-4">
        <iframe src={previewUrl} className="w-full h-96 border rounded" />
        <a
          href={previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline btn-xs"
        >
          Open in New Tab
        </a>
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <img src={fileIcon} alt="file" className="w-20 m-auto" />
      <p className="font-medium">{file.name}</p>
      <p className="text-sm text-error mt-2">
        Word documents cannot be previewed in the browser
      </p>
    </div>
  );
}
