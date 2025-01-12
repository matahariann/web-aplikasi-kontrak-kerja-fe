// ImageViewer.tsx
import React, { useEffect, useState } from 'react';
import { getImage, ImageData } from '@/services/employee'; // Pastikan path sesuai dengan struktur folder Anda

const ImageViewer: React.FC<{ 
  imageId: number;
  className?: string;
}> = ({ imageId, className }) => {
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token tidak ditemukan');
        
        setLoading(true);
        const data = await getImage(token, imageId);
        setImageData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat gambar');
      } finally {
        setLoading(false);
      }
    };

    if (imageId) {
      fetchImage();
    }
  }, [imageId]);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 rounded-lg h-32 w-full" />;
  }

  if (error) {
    return <div className="text-red-500 text-sm">{error}</div>;
  }

  if (!imageData) {
    return null;
  }

  return (
    <img
      src={imageData.image}
      alt={imageData.name}
      className={`object-cover rounded-lg ${className}`}
    />
  );
};

export default ImageViewer;