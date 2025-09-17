import React, { useState } from "react";
import Layout from "../components/Layout";
import { useDocuments } from "../hooks/documents/useDocuments";

export type Document = {
  _id: string;
  userFilename: string;
  uploadedAt: string;
  status: "pending" | "success" | "error";
  s3Filename: string;
  fileUrl: string | null;
};

function Documents() {
  const { documents, isFetching, error } = useDocuments();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date" | "status">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const getStatusBadge = (status: Document["status"]) => {
    switch (status) {
      case "success":
        return <div className="badge badge-success">Success</div>;
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
        return "📄";
      case "docx":
      case "doc":
        return "📝";
      default:
        return "📄";
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

  const formatFileSize = (url: string | null) => {
    // This is a placeholder - in real app you'd get file size from backend
    return "N/A";
  };

  const handleSort = (field: "name" | "date" | "status") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const getSortIcon = (field: "name" | "date" | "status") => {
    if (sortBy !== field) return "↕️";
    return sortOrder === "asc" ? "⬆️" : "⬇️";
  };

  // Filter and sort documents
  const filteredDocuments = documents?.filter((doc) =>
    doc.userFilename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedDocuments = filteredDocuments?.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "name":
        comparison = a.userFilename.localeCompare(b.userFilename);
        break;
      case "date":
        comparison =
          new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
        break;
      case "status":
        comparison = a.status.localeCompare(b.status);
        break;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-center mb-2">My Documents</h1>
          <p className="text-center text-base-content/60">
            Manage and view all your uploaded documents
          </p>
        </div>

        {/* Search and Controls */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search Input */}
              <div className="form-control flex-1">
                <div className="input-group">
                  <span className="bg-base-200">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Search documents..."
                    className="input input-bordered flex-1"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Document Count */}
              <div className="stats shadow">
                <div className="stat place-items-center py-2">
                  <div className="stat-title text-sm">Total Documents</div>
                  <div className="stat-value text-lg">
                    {isFetching ? "..." : sortedDocuments?.length || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isFetching && (
          <div className="flex justify-center items-center py-12">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        )}

        {/* Empty State */}
        {!isFetching && (!sortedDocuments || sortedDocuments.length === 0) && (
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body text-center py-16">
              <div className="text-6xl mb-4">📁</div>
              <h2 className="text-2xl font-bold mb-2">No Documents Found</h2>
              <p className="text-base-content/60 mb-6">
                {searchTerm
                  ? "No documents match your search criteria."
                  : "You haven't uploaded any documents yet."}
              </p>
              {searchTerm && (
                <button
                  className="btn btn-outline"
                  onClick={() => setSearchTerm("")}
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        )}

        {/* Documents Table */}
        {!isFetching && sortedDocuments && sortedDocuments.length > 0 && (
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body p-0">
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleSort("name")}
                        >
                          Document {getSortIcon("name")}
                        </button>
                      </th>
                      <th className="hidden md:table-cell">
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleSort("status")}
                        >
                          Status {getSortIcon("status")}
                        </button>
                      </th>
                      <th className="hidden lg:table-cell">
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleSort("date")}
                        >
                          Upload Date {getSortIcon("date")}
                        </button>
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedDocuments.map((document) => (
                      <tr key={document._id} className="hover">
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
                                ID: {document._id}
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
                            {document.fileUrl &&
                              document.status === "success" && (
                                <a
                                  href={document.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-ghost btn-sm"
                                  title="View Document"
                                >
                                  👁️
                                </a>
                              )}
                            <button
                              className="btn btn-ghost btn-sm"
                              title="More Options"
                            >
                              ⋮
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
        {!isFetching && sortedDocuments && sortedDocuments.length > 0 && (
          <div className="text-center mt-4 text-sm text-base-content/60">
            Showing {sortedDocuments.length} of {documents?.length || 0}{" "}
            documents
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Documents;
