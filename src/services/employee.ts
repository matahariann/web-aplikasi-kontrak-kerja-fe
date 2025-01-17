import axios from "axios";
import axiosInstance from "@/lib/axios";

export type Employee = {
  nip: string;
  nama: string;
  email: string;
  noTelp: string;
  alamat: string;
};

export interface EmployeeResponse {
  success: boolean;
  data: {
    employee: Employee;
  };
}

export interface ImageData {
  id: number;
  name: string;
  image: string;
}

export const getEmployee = async (token: string): Promise<Employee> => {
  try {
    const response = await axios.get<EmployeeResponse>(
      `http://localhost:8000/api/employee/authenticated`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    // Return hanya bagian employee dari response
    return response.data.data.employee;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Gagal mengambil data pegawai"
      );
    }
    throw error;
  }
};

export const getData = async () => {
  try {
    const response = await axiosInstance.get("/get-data");
    return response.data;
  } catch (error) {
    console.error("Error fetching documents:", error);
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error("Gagal mengambil data dokumen");
  }
};

export const getDataDetail = async (nomorKontrak: string) => {
  try {
    const response = await axiosInstance.get(
      `/get-data-detail/${nomorKontrak}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching document detail:", error);
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error("Gagal mengambil detail dokumen");
  }
};

export const getSessionData = async (token: string, sessionId: string) => {
  try {
    const response = await axios.get(
      `http://localhost:8000/api/session-data/${sessionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Gagal mengambil data session"
      );
    }
    throw error;
  }
};

export const getImage = async (
  token: string,
  id: number
): Promise<ImageData> => {
  try {
    const response = await axios.get(
      `http://localhost:8000/api/showImage/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    if (response.data.status === "success") {
      return response.data.data;
    }

    throw new Error(response.data.message || "Gagal mengambil gambar");
  } catch (error) {
    console.error("Error fetching image:", error);
    throw new Error("Terjadi kesalahan dalam mendapatkan gambar");
  }
};
