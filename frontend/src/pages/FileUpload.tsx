import { useState } from "react";
import Layout from "../components/Layout";
import { useSaveDocument } from "../hooks/documents/useSaveDocument";
import { useNavigate } from "react-router-dom";
import { HiArrowRight } from "react-icons/hi";
import { FileDropzone } from "../components/FileDropzone";
import { FilePreview } from "../components/FilePreview";

export default function FileUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { saveDocument, isSaving } = useSaveDocument();
  const navigate = useNavigate();

  const handleUpload = () => {
    if (!selectedFile) return;
    const userEmail = localStorage.getItem("userEmail")!;
    saveDocument({ file: selectedFile, userEmail });
  };

  return (
    <Layout>
      <div className="card bg-base-100 shadow-xl min-w-1/2 rounded-xl m-10">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-6 justify-center">
            File Upload
          </h2>

          <FileDropzone
            selectedFile={selectedFile}
            onFileSelected={setSelectedFile}
          />

          {selectedFile && (
            <div className="mt-6">
              <h2 className="card-title text-2xl mb-6 justify-center">
                File Preview
              </h2>
              <div className="border rounded-lg p-4 bg-base-200">
                <FilePreview file={selectedFile} />
              </div>

              <button
                className="btn btn-primary w-full mt-4"
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
