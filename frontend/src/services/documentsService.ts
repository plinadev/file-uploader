import axios from "axios";
import apiClient from "./apiClient";
import type { Document } from "../types";

interface GenerateUploadUrlPaylod {
  userEmail: string;
  originalFilename: string;
}

interface GenerateUpladUrlResponse {
  uploadUrl: string;
  s3Filename: string;
  documentId: string;
}

export const generateUploadUrl = async (
  payload: GenerateUploadUrlPaylod
): Promise<GenerateUpladUrlResponse> => {
  const response = await apiClient.post<GenerateUpladUrlResponse>(
    "/documents/upload-url",
    payload
  );
  return response.data;
};

export const uploadFileToS3 = async (
  file: File,
  uploadUrl: string
): Promise<void> => {
  await axios.put(uploadUrl, file, {
    headers: {
      "Content-Type": file.type,
    },
  });
};

export const getUserDocuments = async ({
  userEmail,
  search,
}: {
  userEmail: string;
  search?: string;
}) => {
  try {
    const params = new URLSearchParams();
    params.append("userEmail", userEmail);
    if (search) params.append("search", search);
    const response = await apiClient.get(`/documents?${params.toString()}`);
    return response.data as Document[];
  } catch (error: any) {
    console.error(
      "Error fetching documents:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const deleteDocument = async (id: string) => {
  try {
    const response = await apiClient.delete(`/documents/${id}`);
    return response;
  } catch (error: any) {
    console.error(
      "Error deleting document ",
      error.response?.data || error.message
    );
    throw error;
  }
};
