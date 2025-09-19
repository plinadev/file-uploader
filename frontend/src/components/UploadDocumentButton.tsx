import { HiPlus } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

function UploadDocumentButton() {
  const navigate = useNavigate();

  return (
    <button
      className="btn btn-primary gap-2 shadow-lg hover:shadow-xl transition-shadow my-4"
      onClick={() => navigate("/")}
    >
      <HiPlus className="w-5 h-5" />
      Upload Document
    </button>
  );
}

export default UploadDocumentButton;
