import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const GoogleDocViewer = ({ docId }) => {
  // Base URL for Google Docs viewer
  const baseUrl = "https://docs.google.com/document/d/";
  const embedUrl = `${baseUrl}${docId}/preview`;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Document Viewer</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="min-h-[600px] p-0">
        <iframe
          src={embedUrl}
          className="w-full h-full min-h-[600px] border-0"
          title="Google Doc Viewer"
          frameBorder="0"
        />
      </CardContent>
    </Card>
  );
};

export default GoogleDocViewer;