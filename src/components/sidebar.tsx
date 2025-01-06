"use client";

import React from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";

export default function Sidebar() {
  return (
    <div className="fixed left-6 top-24 w-64 bg-white border-gray-200 shadow-md">
      <div className="flex flex-col py-2">
        {/* Home Item */}
        <Link
          href="/employee-beranda"
          className="flex items-center px-4 py-2 mx-2 text-gray-700 rounded-lg hover:bg-gray-100"
          draggable={false}
        >
          <Icon icon="lucide:home" className="w-5 h-5" />
          <span className="ml-3">Beranda</span>
        </Link>
        <Link
          href="/employee-riwayat-dokumen"
          className="flex items-center px-4 py-2 mx-2 text-gray-700 rounded-lg hover:bg-gray-100"
          draggable={false}
        >
          <Icon icon="mdi:archive-time-outline" className="w-5 h-5" />
          <span className="ml-3">Riwayat Dokumen</span>
        </Link>
        <Link
          href="/employee-pembuatan-dokumen"
          className="flex items-center px-4 py-2 mx-2 text-gray-700 rounded-lg hover:bg-gray-100"
          draggable={false}
        >
          <Icon icon="mdi:file-document-plus-outline" className="w-5 h-5" />
          <span className="ml-3">Pembuatan Dokumen</span>
        </Link>
      </div>
    </div>
  );
}
