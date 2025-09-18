import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deleteDocument as deleteDocumentApi } from "../../services/documentsService";

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  const { mutate: deleteDocument, isPending: isDeleting } = useMutation({
    mutationFn: deleteDocumentApi,
    onSuccess: () => {
      toast.success("Document was successfully deleted!");
      queryClient.invalidateQueries({ queryKey: ["documents"], exact: false });
    },
    onError: () => {
      toast.error(
        "Something went wrong while deleting a document! Try again later"
      );
    },
  });

  return { deleteDocument, isDeleting };
};
