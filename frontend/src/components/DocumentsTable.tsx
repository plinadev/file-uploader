import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import type { Document } from "../types";
import { useDocuments } from "../hooks/documents/useDocuments";
import { FcDocument, FcDownload, FcFile, FcFullTrash } from "react-icons/fc";
import { useDeleteDocument } from "../hooks/documents/useDeleteDocument";
import Loader from "./Loader";

function DocumentsTable() {
  const { documents } = useDocuments();
  const { deleteDocument, isDeleting } = useDeleteDocument();
  const [searchParams] = useSearchParams();
  const getStatusBadge = useCallback((status: Document["status"]) => {
    switch (status) {
      case "success":
        return (
          <div className="badge bg-emerald-100 text-emerald-800 border-emerald-200 gap-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            success
          </div>
        );
      case "pending":
        return (
          <div className="badge bg-amber-100 text-amber-800 border-amber-200 gap-1">
            <span className="loading loading-spinner loading-xs"></span>
            pending
          </div>
        );
      case "error":
        return (
          <div className="badge bg-red-100 text-red-800 border-red-200 gap-1">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            error
          </div>
        );
      default:
        return <div className="badge badge-neutral">unknown</div>;
    }
  }, []);

  const getFileIcon = useCallback((filename: string) => {
    const extension = filename.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return <FcFile className="w-6 h-6" />;
      case "docx":
      case "doc":
        return <FcDocument className="w-6 h-6" />;
      default:
        return <FcFile className="w-6 h-6" />;
    }
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  return (
    <div className="card bg-base-100 shadow-xl rounded-2xl overflow-hidden">
      {isDeleting && <Loader />}
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead className="bg-base-300">
            <tr>
              <th className="font-bold">Document</th>
              <th className="hidden md:table-cell font-bold">Status</th>
              <th className="hidden lg:table-cell font-bold">Upload Date</th>
              {searchParams.get("search") && (
                <th className="font-bold">Content Preview</th>
              )}
              <th className="font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((document: Document) => (
              <tr
                key={document.id}
                className="hover:bg-base-50 transition-colors"
              >
                <td>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {getFileIcon(document.userFilename)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div
                        className="font-semibold truncate max-w-xs lg:max-w-sm"
                        title={document.userFilename}
                      >
                        {document.userFilename}
                      </div>
                      <div className="text-xs opacity-60 font-mono">
                        ID: {document.id}
                      </div>
                      {/* Mobile status */}
                      <div className="md:hidden mt-2">
                        {getStatusBadge(document.status)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="hidden md:table-cell">
                  {getStatusBadge(document.status)}
                </td>
                <td className="hidden lg:table-cell">
                  <div
                    className="text-sm"
                    title={formatDate(document.uploadedAt)}
                  >
                    {formatDate(document.uploadedAt)}
                  </div>
                </td>
                {searchParams.get("search") && (
                  <td className="table-cell max-w-md">
                    {document.snippet ? (
                      <div
                        className="text-sm text-base-content/70 leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: document.snippet,
                        }}
                      />
                    ) : (
                      <span className="text-xs opacity-50 italic">
                        No preview available
                      </span>
                    )}
                  </td>
                )}
                <td>
                  <div className="flex gap-1">
                    {document.fileUrl && (
                      <a
                        href={document.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost btn-sm "
                        title="Download Document"
                      >
                        <FcDownload className="w-5 h-5" />
                      </a>
                    )}
                    <button
                      className="btn btn-ghost btn-sm "
                      title="Delete Document"
                      disabled={isDeleting}
                      onClick={() => deleteDocument(document.id)}
                    >
                      <FcFullTrash className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DocumentsTable;
