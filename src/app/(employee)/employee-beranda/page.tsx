"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Employee, getEmployee } from "@/services/employee";
import { House, User, Clock, LayoutDashboard } from "lucide-react";
import EnhancedDashboard from "@/components/DashboardStatistics";

export default function Home() {
  const router = useRouter();
  const [greeting, setGreeting] = useState("");
  const [employee, setEmployee] = useState<Employee | null>(null);

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
      <div className="max-w-[2000px] mx-auto px-6 py-2 space-y-4">
        {/* Header Section */}
        <header className="flex items-center justify-between bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
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
              <div className="bg-white p-2 rounded-full">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div className="space-y-1">
                <h2 className="text-md font-semibold text-white">
                  {greeting}, Selamat datang di Dokumen Kontrak Kerja Apps Ditjen Aptika!
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Statistics */}
        <EnhancedDashboard />
      </div>
    </main>
  );
}