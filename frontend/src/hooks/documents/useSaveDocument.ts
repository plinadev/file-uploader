import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  generateUploadUrl,
  uploadFileToS3,
} from "../../services/documentsService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface SaveDocumentPayload {
  file: File;
  userEmail: string;
}

export const useSaveDocument = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate: saveDocument, isPending: isSaving } = useMutation({
    mutationFn: async ({ file, userEmail }: SaveDocumentPayload) => {
      // get pre-signed URL and document metadata
      const { uploadUrl, documentId } = await generateUploadUrl({
        userEmail,
        originalFilename: file.name,
      });

      // upload file to S3
      await uploadFileToS3(file, uploadUrl);

      return { documentId, userEmail };
    },
    onSuccess: ({ userEmail }) => {
      toast.success("Document was successfully saved!");
      // Invalidate documents query so list refreshes
      queryClient.invalidateQueries({
        queryKey: ["documents", userEmail],
      });
      navigate("/documents");
    },
    onError: () => {
      toast.error(
        "Something went wrong while saving a document! Try again later"
      );
    },
  });

  return { saveDocument, isSaving };
};
