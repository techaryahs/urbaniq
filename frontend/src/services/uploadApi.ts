import api from "./api";

export interface UploadRecord {
  id: number;
  filename: string;
  status: string;
  uploaded_at: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  filename: string;
  imported_count?: number;
}

export const uploadFile = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await api.post("/upload/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getUploadHistory = async (): Promise<UploadRecord[]> => {
  const response = await api.get("/upload/history");
  return response.data;
};
