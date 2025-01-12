"use client";

import GoogleDocViewer from "@/components/GoogleDocViewer";

export default function Home() {
  // Replace this with your Google Doc ID
  const docId = "1irDOliYKXNO0wlnVjiYN4N_P6oockBm0";

  return (
    <div className="w-full h-screen p-4">
      <GoogleDocViewer docId={docId} />
    </div>
  );
}