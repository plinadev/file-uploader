import { useRef, useState } from "react";
import logo from "../assets/logo.svg";
import { FileDetails } from "./FileDetails";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".pdf", ".docx"];
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

interface Props {
  selectedFile: File | null; 
  onFileSelected: (file: File | null) => void; 
}

export function FileDropzone({ selectedFile, onFileSelected }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file: File) => {
    if (file.size > MAX_FILE_SIZE) return "File size must be less than 10MB";
    const fileName = file.name.toLowerCase();
    if (!ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext)))
      return "Only PDF and DOCX files are allowed";
    if (!ALLOWED_MIME_TYPES.includes(file.type))
      return "Invalid file type. Only PDF and DOCX files are allowed";
    return null;
  };

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    onFileSelected(file); // notify parent
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  return (
    <div>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          isDragging
            ? "border-primary bg-primary/10"
            : "border-gray-300 hover:border-primary hover:bg-base-200"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={handleDrop}
      >
        {!selectedFile ? (
          <div className="space-y-4">
            <img src={logo} alt="folder" className="w-20 m-auto" />
            <p className="text-lg font-medium">
              Drag & drop your file here, or click to browse
            </p>
            <button
              className="btn btn-primary"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose File
            </button>
          </div>
        ) : (
          <FileDetails
            file={selectedFile}
            formatSize={(bytes: number) =>
              bytes === 0 ? "0 Bytes" : `${(bytes / 1024 / 1024).toFixed(2)} MB`
            }
            onRemove={() => onFileSelected(null)} // reset selected file
            onChooseNew={() => fileInputRef.current?.click()} // open file picker
          />
        )}
      </div>

      {error && <div className="alert alert-error mt-4">{error}</div>}

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleInputChange}
      />
    </div>
  );
}
