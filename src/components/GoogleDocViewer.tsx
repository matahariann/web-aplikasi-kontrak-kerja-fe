import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const GoogleDocViewer = ({ docId }) => {
  const baseUrl = "https://drive.google.com/file/d/";
  const embedUrl = `${baseUrl}${docId}/preview`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Template Dokumen Kontrak Kerja</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="w-full">
          <iframe
            src={embedUrl}
            className="w-full h-[85vh]"
            title="Google Doc Viewer"
            frameBorder="0"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleDocViewer;