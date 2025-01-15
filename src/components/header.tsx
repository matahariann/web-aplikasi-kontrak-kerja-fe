"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import useScroll from "@/hooks/use-scroll";
import { Employee, getEmployee } from "@/services/employee";
import { useSelectedLayoutSegment, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Header = () => {
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const scrolled = useScroll(5);
  const selectedLayout = useSelectedLayoutSegment();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const getData = async (token: string) => {
    try {
      const employeeData = await getEmployee(token);
      setEmployee(employeeData);
      console.log("Employee data:", employeeData); // untuk debugging
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

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/");
    } catch (error: any) {
      console.error(error.message);
    }
  };

  return (
    <div
      className={cn(`sticky inset-x-0 top-0 z-30 w-full transition-all`, {
        "bg-white/75 backdrop-blur-lg": scrolled,
        "bg-white": selectedLayout,
      })}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 shadow-md">
        {/* Left side - Menu and Search */}
        <div className="flex items-center space-x-4">
          {/* <button className="p-1.5 hover:bg-gray-100 rounded-lg">
            <Icon icon="lucide:menu" className="w-6 h-6 text-gray-600" />
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded-lg">
            <Icon icon="lucide:search" className="w-6 h-6 text-gray-600" />
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded-lg">
            <Icon icon="lucide:maximize" className="w-6 h-6 text-gray-600" />
          </button> */}
        </div>

        {/* Center - Title */}
        <div
          className="flex items-center absolute left-1/2 transform -translate-x-1/2"
          style={{ userSelect: "none" }}
        >
          <img
            src="/logo_kominfo.png"
            alt="Logo Kominfo"
            className="h-10 w-10"
            draggable={false}
          />
          <span className="ml-2 text-xl font-semibold">
            Dokumen Kontrak Kerja Apps
          </span>
        </div>

        {/* Right side - User Profile with Dropdown */}
        <div className="relative">
          <div
            className="flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-gray-100 cursor-pointer"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            style={{ userSelect: "none" }}
          >
            <img
              src="/profile-photo.png"
              alt="Profile"
              className="h-8 w-8 rounded-full"
              draggable={false}
            />
            <span className="font-medium">
              {employee?.nama}
            </span>
            <Icon icon="lucide:chevron-down" className="w-4 h-4" />
          </div>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg flex items-center space-x-2">
                    <Icon icon="lucide:log-out" className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Apakah anda yakin ingin keluar?
                    </AlertDialogTitle>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setIsProfileOpen(false)}>
                      Batal
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout}>
                      Keluar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
