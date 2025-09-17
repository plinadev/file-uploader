import { useQuery } from "@tanstack/react-query";
import { getUserDocuments } from "../../services/documentsService";
import toast from "react-hot-toast";
import type { Document } from "../../types";

export const useDocuments = () => {
  const userEmail = localStorage.getItem("userEmail");

  const {
    data: documents = [],
    isFetching,
    error,
  } = useQuery<Document[], Error>({
    queryKey: ["documents", userEmail],
    queryFn: () => {
      if (!userEmail) {
        toast.error("User email not found");
        throw new Error("User email not found");
      }
      return getUserDocuments({ userEmail });
    },
    enabled: !!userEmail,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return {
    documents,
    isFetching,
    error,
  };
};
