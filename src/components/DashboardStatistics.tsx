import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { getData } from '@/services/employee'; // Assuming this is the correct import path
import {  FileText, Package } from 'lucide-react';

export default function EnhancedDashboard() {
  const [documentStats, setDocumentStats] = useState({
    total: 0,
    byType: [
      { name: 'Konsultan', value: 0, color: '#0088FE' },
      { name: 'Barang', value: 0, color: '#00C49F' },
      { name: 'Konstruksi', value: 0, color: '#FFBB28' },
      { name: 'Jasa Lainnya', value: 0, color: '#FF8042' }
    ]
  });

  useEffect(() => {
    const fetchDocumentStats = async () => {
      try {
        const documents = await getData();
        
        const stats = {
          total: documents.length,
          byType: [
            { name: 'Konsultan', value: documents.filter(doc => 
              doc.contracts?.some(contract => contract.jenis_kontrak === 'Konsultan')
            ).length, color: '#0088FE' },
            { name: 'Barang', value: documents.filter(doc => 
              doc.contracts?.some(contract => contract.jenis_kontrak === 'Barang')
            ).length, color: '#00C49F' },
            { name: 'Konstruksi', value: documents.filter(doc => 
              doc.contracts?.some(contract => contract.jenis_kontrak === 'Konstruksi')
            ).length, color: '#FFBB28' },
            { name: 'Jasa Lainnya', value: documents.filter(doc => 
              doc.contracts?.some(contract => contract.jenis_kontrak === 'Jasa Lainnya')
            ).length, color: '#FF8042' }
          ]
        };
        
        setDocumentStats(stats);
      } catch (error) {
        console.error('Failed to fetch document stats', error);
      }
    };

    fetchDocumentStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      {/* Document Statistics Cards */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">Statistik Dokumen</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Total Dokumen</p>
            <p className="text-2xl font-bold text-blue-600">{documentStats.total}</p>
          </div>
          {documentStats.byType.map((type) => (
            <div 
              key={type.name} 
              className="bg-gray-50 p-4 rounded-lg"
              style={{ borderLeft: `4px solid ${type.color}` }}
            >
              <p className="text-sm text-gray-500">{type.name}</p>
              <p className="text-xl font-bold" style={{ color: type.color }}>
                {type.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Document Type Distribution */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Package className="h-6 w-6 text-green-600" />
          <h2 className="text-xl font-bold text-gray-800">Distribusi Jenis Kontrak</h2>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={documentStats.byType}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {documentStats.byType.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}