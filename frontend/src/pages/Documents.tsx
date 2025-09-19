import Layout from "../components/Layout";
import { useDocuments } from "../hooks/documents/useDocuments";
import { useSearchParams } from "react-router-dom";
import { useDocumentSSE } from "../hooks/useDocumentSSE";
import SearchArea from "../components/SearchArea";
import UploadDocumentButton from "../components/UploadDocumentButton";
import DocumentError from "../components/DocumentError";
import DocumentsLoader from "../components/DocumentsLoader";
import Empty from "../components/Empty";
import DocumentsTable from "../components/DocumentsTable";

function Documents() {
  useDocumentSSE();
  const { documents, isFetching, error } = useDocuments();
  const [searchParams] = useSearchParams();

  if (error) {
    return <DocumentError />;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            My Documents
          </h1>
          <p className="text-base-content/70 text-lg max-w-2xl mx-auto">
            Search, organize and manage all your uploaded documents in one place
          </p>
        </div>

        <SearchArea />

        <UploadDocumentButton />

        {isFetching && <DocumentsLoader />}

        {!isFetching && documents.length === 0 && <Empty />}

        {!isFetching && documents.length > 0 && (
          <>
            <DocumentsTable />
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
          </>
        )}
      </div>
    </Layout>
  );
}

export default Documents;
