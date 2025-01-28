"use client";

import axios from "axios";
import axiosInstance from "@/lib/axios";

export interface OfficialData {
  id?: string;
  nip: string;
  nama: string;
  jabatan: string;
  periode_jabatan: string;
  surat_keputusan?: string;
}

interface OfficialResponse {
  message: string;
  data: {
    official: OfficialData;
    session: {
      id: string;
      current_step: string;
    };
  };
}

export const addOfficial = async (
  token: string,
  officialsData: OfficialData[]
): Promise<OfficialResponse> => {
  try {
    const response = await axios.post<OfficialResponse>(
      `http://localhost:8000/api/add-official`,
      { officials: officialsData },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error || "Gagal menyimpan data pejabat"
      );
    }
    throw error;
  }
};

export const updateOfficial = async (
  token: string,
  id: string,
  data: OfficialData
): Promise<OfficialResponse> => {
  try {
    const response = await axios.put<OfficialResponse>(
      `http://localhost:8000/api/update-official/${id}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error || "Gagal memperbarui data pejabat"
      );
    }
    throw error;
  }
};

export const getOfficialData = async () => {
  try {
    const response = await axiosInstance.get("/get-official");
    return response.data;
  } catch (error) {
    console.error("Official fetch error:", error);
    return {
      data: {
        officials: [],
        session: {
          id: "",
          current_step: "official",
          temp_data: {},
        },
      },
    };
  }
};

export const getPeriodes = async (token: string) => {
  try {
    const response = await axios.get(`http://localhost:8000/api/get-periode`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Gagal mengambil data periode"
      );
    }
    throw error;
  }
};

export const getOfficialsByPeriode = async (token: string, periode: string) => {
  try {
    const response = await axios.get(
      `http://localhost:8000/api/get-official-by-periode/${periode}`,
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
        error.response?.data?.message || "Gagal mengambil data pejabat"
      );
    }
    throw error;
  }
};

export const updateOfficialSession = async (
  token: string,
  officialId: string,
  data: {
    form_session_id: string;
    is_new_data?: boolean;
    officials?: OfficialData[];
    temp_data?: any;
  }
): Promise<any> => {
  try {
    const response = await axios.put(
      `http://localhost:8000/api/update-official-session/${officialId}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error || "Gagal memperbarui sesi official"
      );
    }
    throw error;
  }
};