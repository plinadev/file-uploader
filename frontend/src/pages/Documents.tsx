import { useState, useEffect, useCallback } from "react";
import Layout from "../components/Layout";
import Loader from "../components/Loader";
import { useDeleteDocument } from "../hooks/documents/useDeleteDocument";
import { useDocuments } from "../hooks/documents/useDocuments";
import type { Document } from "../types";
import { FcDocument, FcDownload, FcFile, FcFullTrash } from "react-icons/fc";
import { HiPlus, HiX, HiXCircle } from "react-icons/hi";
import { useNavigate, useSearchParams } from "react-router-dom";
import file from "../assets/file.svg";
import { useDocumentSSE } from "../hooks/useDocumentSSE";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function Documents() {
  useDocumentSSE();
  const { documents, isFetching, error } = useDocuments();
  const navigate = useNavigate();
  const { deleteDocument, isDeleting } = useDeleteDocument();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSearch = searchParams.get("search") || "";
  const [inputValue, setInputValue] = useState(initialSearch);
  const [isSearching, setIsSearching] = useState(false);

  const debouncedSearchTerm = useDebounce(inputValue.trim(), 800);

  useEffect(() => {
    if (debouncedSearchTerm !== initialSearch) {
      if (debouncedSearchTerm) {
        setSearchParams({ search: debouncedSearchTerm });
      } else {
        setSearchParams({});
      }
      setIsSearching(false);
    }
  }, [debouncedSearchTerm, setSearchParams, initialSearch]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      setIsSearching(true);
    },
    []
  );

  const clearSearch = useCallback(() => {
    setInputValue("");
    setSearchParams({});
    setIsSearching(false);
  }, [setSearchParams]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        const trimmedValue = inputValue.trim();
        if (trimmedValue) {
          setSearchParams({ search: trimmedValue });
        } else {
          setSearchParams({});
        }
        setIsSearching(false);
      }
    },
    [inputValue, setSearchParams]
  );

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

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="alert alert-error shadow-lg flex flex-row=">
            <HiXCircle size={20} />
            <div>
              <h3 className="font-bold">Failed to load documents</h3>
              <div className="text-xs">
                Please try refreshing the page or visit it later.
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {isDeleting && <Loader />}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Enhanced Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            My Documents
          </h1>
          <p className="text-base-content/70 text-lg max-w-2xl mx-auto">
            Search, organize and manage all your uploaded documents in one place
          </p>
        </div>

        {/* Enhanced Search and Filters */}
        <div className="card bg-base-100 shadow-xl rounded-2xl">
          <div className="card-body flex flex-col items-center md:flex-row md:items-start justify-between">
            {/* Search Bar */}
            <div className="w-[80%] flex flex-col lg:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label className="w-full input input-bordered flex items-center gap-2 focus-within:input-primary transition-colors">
                  <svg
                    className="w-4 h-4 opacity-70"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    className="grow"
                    placeholder="Search by filename, content, or document ID..."
                    value={inputValue}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                  />
                  {(inputValue || isSearching) && (
                    <button
                      onClick={clearSearch}
                      className="btn btn-ghost btn-sm btn-circle "
                      title="Clear search"
                    >
                      {isSearching ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        <HiX className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </label>

                <div className="text-xs text-base-content/60 mt-1">
                  Press Enter to search or wait for auto-search
                </div>
              </div>
            </div>

            {/* Status Filter Tabs and Stats */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="stats stats-horizontal shadow-sm bg-gradient-to-r from-base-200 to-base-300">
                <div className="stat py-2 px-10 text-center">
                  <div className="stat-title text-xs">Showing</div>
                  <div className="stat-value text-lg">
                    {isFetching ? (
                      <span className="loading loading-infinity loading-lg "></span>
                    ) : (
                      documents.length
                    )}
                  </div>
                  <div className="stat-desc text-xs">documents</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button
          className="btn btn-primary gap-2 shadow-lg hover:shadow-xl transition-shadow my-4"
          onClick={() => navigate("/")}
        >
          <HiPlus className="w-5 h-5" />
          Upload Document
        </button>
        {/* Loading State */}
        {isFetching && (
          <div className="flex flex-col justify-center items-center py-16">
            <span className="loading loading-infinity loading-xl text-primary mb-4"></span>
            <p className="text-base-content/60">Loading your documents...</p>
          </div>
        )}

        {/* Empty State */}
        {!isFetching && documents.length === 0 && (
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
              <div className="flex gap-3 justify-center flex-wrap">
                {searchParams.get("search") && (
                  <button className="btn btn-outline" onClick={clearSearch}>
                    Clear Search
                  </button>
                )}
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/")}
                >
                  <HiPlus className="w-4 h-4" />
                  Upload Document
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Documents Table */}
        {!isFetching && documents.length > 0 && (
          <div className="card bg-base-100 shadow-xl rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead className="bg-base-300">
                  <tr>
                    <th className="font-bold">Document</th>
                    <th className="hidden md:table-cell font-bold">Status</th>
                    <th className="hidden lg:table-cell font-bold">
                      Upload Date
                    </th>
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
        )}

        {!isFetching && documents.length > 0 && (
          <div className="text-center mt-6">
            <div className="text-sm text-base-content/60 leading-relaxed">
              {searchParams.get("search") && (
                <>
                  <span className="font-medium">Search results for "</span>
                  <span className="font-bold text-primary">
                    {searchParams.get("search")}
                  </span>
                  <span className="font-medium">" • </span>
                </>
              )}
              <span>Showing </span>
              <span className="font-bold text-secondary">
                {documents.length}
              </span>
              <span> documents</span>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Documents;
