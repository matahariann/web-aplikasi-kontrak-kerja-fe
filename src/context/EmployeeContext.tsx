"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Employee, getEmployee } from '@/services/employee';
import { useRouter } from 'next/navigation';
interface EmployeeContextType {
  employee: Employee | null;
  setEmployee: React.Dispatch<React.SetStateAction<Employee | null>>;
}
const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);
export const EmployeeProvider = ({ children }: { children: React.ReactNode }) => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const router = useRouter();
  useEffect(() => {
    const initializeEmployee = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/');
        return;
      }
      try {
        const employeeData = await getEmployee(token);
        setEmployee(employeeData);
      } catch (error) {
        console.error('Error initializing employee data:', error);
        router.push('/');
      }
    };
    initializeEmployee();
  }, [router]);
  return (
    <EmployeeContext.Provider value={{ employee, setEmployee }}>
      {children}
    </EmployeeContext.Provider>
  );
};
export const useEmployee = () => {
  const context = useContext(EmployeeContext);
  if (context === undefined) {
    throw new Error('useEmployee must be used within an EmployeeProvider');
  }
  return context;
};