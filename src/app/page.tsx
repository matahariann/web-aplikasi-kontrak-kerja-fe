"use client";
import React, { useState } from "react";
import { login } from "../services/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLoginClick = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    try {
      const res = await login(email, password);
      if (res) {
        console.log("ini berhasil login");
        localStorage.setItem("token", res.token);
        router.push("/employee-beranda");
        console.log(res);
      }
    } catch (error: any) {
      console.error(error);
      setError(error.message); // This will now display our custom validation messages
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-900 to-blue-600 flex items-center justify-center p-4">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-20 h-20 bg-blue-400/20 rounded-full blur-xl" />
        <div className="absolute bottom-20 right-20 w-20 h-20 bg-blue-400/20 rounded-full blur-xl" />
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-blue-400/20 rounded-full blur-xl" />
      </div>

      {/* Login Card */}
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md relative">
        {/* Logo */}
        <div className="mb-4 flex justify-center">
          <div className="w-24 h-24 flex items-center justify-center">
            {" "}
            {/* Ubah ukuran container */}
            <Image
              src="/logo_kominfo.png"
              alt="Kominfo Logo"
              width={160}
              height={160}
              className="w-full h-full object-contain"
              priority
            />
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-white mb-2 text-center">
          Sekretariat Ditjen Aptika
        </h2>
        <div className="flex-grow border-t border-gray-200"></div>
        <h2 className="text-2xl font-semibold text-white mt-2 mb-6 text-center">
          Dokumen Kontrak Kerja Apps
        </h2>

        <form>
          {/* Email Input */}
          <div className="mb-4">
            <label className="block text-white text-sm mb-2">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
              placeholder="email@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password Input */}
          <div className="mb-6">
            <label className="block text-white text-sm mb-2">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="mt-2 text-right">
              <a href="#" className="text-sm text-white/80 hover:text-white">
                Forgot Password?
              </a>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 text-red-300 text-sm text-center">{error}</div>
          )}

          {/* Login Button */}
          <button
            onClick={handleLoginClick}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
          >
            Sign in
          </button>
        </form>

        {/* Register Link */}
        <div className="mt-6 text-center text-white/80 text-sm">
          Dont have an account?{" "}
          <a href="#" className="text-white hover:underline">
            Register now
          </a>
        </div>
      </div>
    </div>
  );
}
