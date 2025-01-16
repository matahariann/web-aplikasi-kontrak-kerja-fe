"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Employee, getEmployee } from "@/services/employee";
import GoogleDocViewer from "@/components/GoogleDocViewer";
import { House, User, Clock } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [greeting, setGreeting] = useState("");
  const [employee, setEmployee] = useState<Employee | null>(null);
  const docId = "1irDOliYKXNO0wlnVjiYN4N_P6oockBm0";

  const getData = async (token: string) => {
    try {
      const res = await getEmployee(token);
      setEmployee(res);
    } catch (error) {
      console.error("Error getting employee data:", error);
      router.push("/");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
    } else {
      getData(token);
    }
  }, [router]);

  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) {
        return "Selamat Pagi";
      } else if (hour >= 12 && hour < 15) {
        return "Selamat Siang";
      } else if (hour >= 15 && hour < 18) {
        return "Selamat Sore";
      } else {
        return "Selamat Malam";
      }
    };

    setGreeting(getGreeting());

    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="bg-gray-50">
      <div className="max-w-[2000px] mx-auto p-6 space-y-6">
        {/* Header Section */}
        <header className="flex items-center justify-between bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3">
            <House className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">Beranda</h1>
          </div>
          <div className="flex items-center gap-4">
            <Clock className="h-5 w-5 text-gray-500" />
            <span className="text-gray-600">
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </header>

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-full">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div className="space-y-1">
                <h2 className="text-md font-semibold text-white">
                  {greeting}, {employee?.nama}!
                </h2>
                <p className="text-blue-100">
                  Selamat datang di Dokumen Kontrak Kerja Apps Ditjen Aptika
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Document Viewer Container */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="w-full rounded-lg overflow-hidden border border-gray-200">
            <GoogleDocViewer docId={docId} />
          </div>
        </div>
      </div>
    </main>
  );
}
