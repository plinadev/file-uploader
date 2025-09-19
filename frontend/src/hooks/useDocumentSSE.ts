import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import apiClient from "../services/apiClient";

export function useDocumentSSE() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) return;

    const baseURL = apiClient.defaults.baseURL ?? "";
    const eventSource = new EventSource(
      `${baseURL}/documents/stream?userEmail=${encodeURIComponent(userEmail)}`
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        queryClient.setQueriesData(
          { queryKey: ["documents"], exact: false },
          (oldDocs: any[] = []) =>
            oldDocs.map((doc) =>
              doc.id === data.id ? { ...doc, status: data.status } : doc
            )
        );
      } catch (err) {
        console.error("SSE parse error:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE error:", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [queryClient]);
}
