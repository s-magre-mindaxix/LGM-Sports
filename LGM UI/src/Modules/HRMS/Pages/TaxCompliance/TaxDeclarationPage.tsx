import React, { useState, useEffect } from 'react';
import DeclarationForm from './DeclarationForm';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../../../../hooks/useAuth';
import apiClient from '../../../../API/apiClient';
import { API_ENDPOINTS } from '../../../../API/apiConfig';
import { toast } from "sonner";

export type UserRole = 'Employee' | 'Admin' | 'HR';

interface EmployeeSelectItem {
    id: number;
    fullName: string;
}

const TaxDeclarationPage: React.FC = () => {
    const { user } = useAuth();
    const currentUserRole = user?.role as UserRole;

    const [employeeList, setEmployeeList] = useState<EmployeeSelectItem[]>([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
    const [isEmployeeListLoading, setIsEmployeeListLoading] = useState(false);

    const isUserAdmin = currentUserRole === 'Admin' || currentUserRole === 'HR';

    useEffect(() => {
        const fetchEmployeesForSelection = async () => {
            setIsEmployeeListLoading(true);
            try {
                const response = await apiClient.get<EmployeeSelectItem[]>(API_ENDPOINTS.EmployeeSelectionList);
                setEmployeeList(response.data);
            } catch  {
                toast.error("Failed to fetch employee list.");
            } finally {
                setIsEmployeeListLoading(false);
            }
        };

        if (isUserAdmin) {
            fetchEmployeesForSelection();
        }
    }, [isUserAdmin]);

    const employeeIdToShow = isUserAdmin ? selectedEmployeeId : user?.employeeId;

    return (
        <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Investment Declaration
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Manage or approve tax-saving investment declarations.
                    </p>
                </div>
            </div>
            
            {isUserAdmin && (
                <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border max-w-sm">
                    <label htmlFor="employee-selector" className="block text-sm font-medium text-gray-700 mb-1">
                        Select Employee to Manage
                    </label>
                    <select
                        id="employee-selector"
                        value={selectedEmployeeId ?? ''}
                        onChange={(e) => setSelectedEmployeeId(e.target.value ? Number(e.target.value) : null)}
                        className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                        disabled={isEmployeeListLoading}
                    >
                        <option value="">-- {isEmployeeListLoading ? 'Loading employees...' : 'Select an employee'} --</option>
                        {employeeList.map(emp => (
                            <option key={emp.id} value={emp.id}>
                                {emp.fullName}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {employeeIdToShow ? (
    
                <DeclarationForm 
                    key={employeeIdToShow} 
                    employeeId={employeeIdToShow} 
                    userRole={currentUserRole} 
                />
            ) : (
                <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500 flex flex-col items-center gap-4">
                    <ShieldCheck size={48} className="text-gray-400" />
                    {isUserAdmin ? (
                        <p>Please select an employee from the dropdown to begin.</p>
                    ) : (
                        <p>Loading your declaration details...</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default TaxDeclarationPage;