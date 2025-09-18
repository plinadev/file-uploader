export type Document = {
  id: string;
  userFilename: string;
  uploadedAt: string;
  status: "pending" | "success" | "error";
  s3Filename: string;
  fileUrl: string | null;
};
