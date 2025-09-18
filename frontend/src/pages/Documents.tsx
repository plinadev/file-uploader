import Layout from "../components/Layout";
import Loader from "../components/Loader";
import { useDeleteDocument } from "../hooks/documents/useDeleteDocument";
import { useDocuments } from "../hooks/documents/useDocuments";
import type { Document } from "../types";
import { FcDocument, FcDownload, FcFile, FcFullTrash } from "react-icons/fc";
import { HiPlus } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import file from "../assets/file.svg";

function Documents() {
  const { documents, isFetching, error } = useDocuments();
  const navigate = useNavigate();
  const { deleteDocument, isDeleting } = useDeleteDocument();
  const getStatusBadge = (status: Document["status"]) => {
    switch (status) {
      case "success":
        return <div className="badge bg-emerald-200">Success</div>;
      case "pending":
        return <div className="badge badge-warning">Pending</div>;
      case "error":
        return <div className="badge badge-error">Error</div>;
      default:
        return <div className="badge badge-neutral">Unknown</div>;
    }
  };

  const getFileIcon = (filename: string) => {
    const extension = filename.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return <FcFile />;
      case "docx":
      case "doc":
        return <FcDocument />;
      default:
        return <FcFile />;
    }
  };

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

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="alert alert-error">
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
            <span>Error loading documents. Please try again later.</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {isDeleting && <Loader />}
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-center mb-2">My Documents</h1>
          <p className="text-center text-base-content/60">
            Manage and view all your uploaded documents
          </p>
        </div>

        {/* Search and Controls */}
        <div className="card bg-base-100 shadow-lg rounded-xl">
          <div className="card-body">
            <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
              {/* Search Input */}
              <label className="input w-[60%]">
                <svg
                  className="h-[1em] opacity-50"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <g
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    strokeWidth="2.5"
                    fill="none"
                    stroke="currentColor"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                  </g>
                </svg>
                <input type="search" className="grow" placeholder="Search" />
              </label>

              {/* Document Count */}
              <div className="stats shadow ">
                <div className="stat place-items-center py-2">
                  <div className="stat-title text-sm">Total Documents</div>
                  <div className="stat-value text-lg">
                    {isFetching ? (
                      <span className="loading loading-infinity loading-md"></span>
                    ) : (
                      documents?.length || 0
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button
          className="btn btn-primary mt-2 mb-6 rounded-md"
          onClick={() => navigate("/")}
        >
          <HiPlus />
          Upload Document
        </button>

        {/* Loading State */}
        {isFetching && (
          <div className="flex justify-center items-center py-12">
            <span className="loading loading-infinity loading-xl"></span>
          </div>
        )}

        {/* Empty State */}
        {!isFetching && documents.length === 0 && (
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body text-center py-16">
              <img src={file} alt="file" className="w-15 m-auto" />

              <h2 className="text-2xl font-bold mb-2"> No Documents Found</h2>
              <p className="text-base-content/60 mb-6">
                {documents.length === 0 &&
                  "You haven't uploaded any documents or none of them match your search criteria"}
              </p>
            </div>
          </div>
        )}

        {/* Documents Table */}
        {!isFetching && documents && documents.length > 0 && (
          <div className="card bg-base-100 shadow-lg rounded-xl">
            <div className="card-body p-0">
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Document</th>
                      <th className="hidden md:table-cell">Status</th>
                      <th className="hidden lg:table-cell">Upload Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((document) => (
                      <tr key={document.id} className="hover">
                        <td>
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">
                              {getFileIcon(document.userFilename)}
                            </div>
                            <div>
                              <div
                                className="font-bold truncate max-w-xs"
                                title={document.userFilename}
                              >
                                {document.userFilename}
                              </div>
                              <div className="text-sm opacity-50">
                                ID: {document.id}
                              </div>
                              {/* Mobile status */}
                              <div className="md:hidden mt-1">
                                {getStatusBadge(document.status)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="hidden md:table-cell">
                          {getStatusBadge(document.status)}
                        </td>
                        <td className="hidden lg:table-cell">
                          <div className="text-sm">
                            {formatDate(document.uploadedAt)}
                          </div>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            {document.fileUrl && (
                              <a
                                href={document.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-ghost btn-sm"
                                title="View Document"
                              >
                                <FcDownload size={22} />
                              </a>
                            )}
                            <button
                              className="btn btn-ghost btn-sm"
                              title="More Options"
                              disabled={isDeleting}
                              onClick={() => deleteDocument(document.id)}
                            >
                              <FcFullTrash size={22} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Results Info */}
        {!isFetching && documents && documents.length > 0 && (
          <div className="text-center mt-4 text-sm text-base-content/60">
            Showing {documents.length} of {documents?.length || 0} documents
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Documents;
