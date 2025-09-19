import { HiXCircle } from "react-icons/hi";
import Layout from "./Layout";

function DocumentError() {
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

export default DocumentError;
