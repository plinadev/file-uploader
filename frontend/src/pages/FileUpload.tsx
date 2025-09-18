import { useRef, useState, useEffect } from "react";
import Layout from "../components/Layout";
import logo from "../assets/logo.svg";
import document from "../assets/document.svg";
import file from "../assets/file.svg";
import { useSaveDocument } from "../hooks/documents/useSaveDocument";
import { useNavigate } from "react-router-dom";
import { HiArrowRight } from "react-icons/hi";

function FileUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { saveDocument, isSaving } = useSaveDocument();
  const navigate = useNavigate();

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
  const ALLOWED_EXTENSIONS = [".pdf", ".docx"];
  const ALLOWED_MIME_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return "File size must be less than 10MB";
    }
    const fileName = file.name.toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) =>
      fileName.endsWith(ext)
    );
    if (!hasValidExtension) {
      return "Only PDF and DOCX files are allowed";
    }
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return "Invalid file type. Only PDF and DOCX files are allowed";
    }
    return null;
  };

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }
    setError("");
    setSelectedFile(file);
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    const files = event.dataTransfer.files;
    if (files.length > 1) {
      setError("Please upload only one file at a time");
      return;
    }
    const file = files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError("");
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Generate preview URL for PDFs
  useEffect(() => {
    if (selectedFile && selectedFile.type === "application/pdf") {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);
  const handleUpload = async () => {
    if (!selectedFile) return;

    const userEmail = localStorage.getItem("userEmail")!;
    saveDocument({ file: selectedFile, userEmail });
  };
  return (
    <Layout>
      <div className="card bg-base-100 shadow-xl min-w-1/2 rounded-xl m-10">
        <div className="card-body">
          <div className="flex flex-col gap-10">
            <div>
              <h2 className="card-title text-2xl mb-6 justify-center">
                File Upload
              </h2>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/10"
                    : "border-gray-300 hover:border-primary hover:bg-base-200"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {!selectedFile ? (
                  <div className="space-y-4">
                    <img src={logo} alt="folder" className="w-20 m-auto" />
                    <p className="text-lg font-medium">
                      Drag & drop your file here, or click to browse
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Supports: PDF, DOCX files (Max 10MB)
                    </p>
                    <button
                      className="btn btn-primary"
                      onClick={handleUploadClick}
                    >
                      Choose File
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <img
                      src={document}
                      alt="document"
                      className="w-20 m-auto"
                    />

                    <div className="bg-success/10 p-4 rounded-lg mt-5">
                      <p className="font-semibold text-emerald-500 mb-2">
                        File Selected Successfully!
                      </p>
                      <div className="text-sm space-y-1">
                        <p>
                          <strong>Name:</strong> {selectedFile.name}
                        </p>
                        <p>
                          <strong>Size:</strong>{" "}
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                      <div className="mt-4 space-x-2">
                        <button
                          className="btn btn-error btn-sm"
                          onClick={handleRemoveFile}
                        >
                          Remove File
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={handleUploadClick}
                        >
                          Choose Different File
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {selectedFile && (
              <div className="mt-6">
                <h2 className="card-title text-2xl mb-6 justify-center">
                  File Preview
                </h2>
                <div className="border rounded-lg p-4 bg-base-200">
                  {selectedFile.type === "application/pdf" && previewUrl ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          PDF Preview:
                        </span>
                        <a
                          href={previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline btn-xs"
                        >
                          Open in New Tab
                        </a>
                      </div>
                      <div className="w-full h-96 border rounded overflow-hidden">
                        <iframe
                          src={previewUrl}
                          className="w-full h-full"
                          title="PDF Preview"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <img src={file} alt="file" className="w-20 m-auto" />

                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-error mt-2">
                        Word documents cannot be previewed in the browser
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        The file will be processed when uploaded
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="alert alert-error mt-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileInputChange}
          />

          {selectedFile && !error && (
            <div className="mt-6 text-center">
              <button
                className="btn btn-primary w-full"
                onClick={handleUpload}
                disabled={isSaving}
              >
                {isSaving ? (
                  <span className="loading loading-infinity loading-lg"></span>
                ) : (
                  "Submit File"
                )}
              </button>
            </div>
          )}
        </div>
        <button
          className="btn mt-2 mb-6 rounded-none"
          onClick={() => navigate("/documents")}
        >
          Go to documents <HiArrowRight />
        </button>
      </div>
    </Layout>
  );
}

export default FileUpload;
