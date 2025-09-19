import { useSearchParams } from "react-router-dom";
import file from "../assets/file.svg";

function Empty() {
  const [searchParams] = useSearchParams();

  return (
    <div className="card bg-base-100 shadow-xl rounded-2xl">
      <div className="card-body text-center py-16">
        <img
          src={file}
          alt="No documents"
          className="w-24 h-24 mx-auto mb-6 opacity-60"
        />
        <h2 className="text-2xl font-bold mb-3">
          {searchParams.get("search")
            ? "No matching documents found"
            : "No documents uploaded yet"}
        </h2>
        <p className="text-base-content/60 mb-6 max-w-md mx-auto">
          {searchParams.get("search")
            ? "Try adjusting your search terms or upload new documents to get started."
            : "Upload your first document to begin organizing and searching your files."}
        </p>
      </div>
    </div>
  );
}

export default Empty;
