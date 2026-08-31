'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, RefreshCw, X, Search, Users, Building2 } from 'lucide-react';
import { Pagination } from '../common/Pagination';

interface SalesCustomersViewProps {
  darkMode: boolean;
  customers: any[];
  onRefresh: () => void;
  onAddCustomer?: () => void;
  showAddCustomerModal?: boolean;
  setShowAddCustomerModal?: (show: boolean) => void;
  customerForm?: any;
  setCustomerForm?: (form: any) => void;
  handleCreateCustomer?: (e: React.FormEvent) => void;
}

export const SalesCustomersView: React.FC<SalesCustomersViewProps> = ({
  darkMode,
  customers,
  onRefresh,
  onAddCustomer
}) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleOpenAddCustomer = () => {
    if (onAddCustomer) {
      onAddCustomer();
    } else {
      router.push('/sales/customers/new');
    }
  };

  const filteredCustomers = customers.filter(c =>
    !searchQuery ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.contactPerson && c.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.salesExecutive && c.salesExecutive.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / itemsPerPage));
  const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Customer Master Directory
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage B2B enterprise client accounts, contact persons, credit profiles, and assigned sales executives.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onRefresh}
            className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition-colors cursor-pointer ${
              darkMode ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleOpenAddCustomer}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by code, company, contact..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className={`w-full pl-10 pr-4 py-2 rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all ${
              darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
            }`}
          />
        </div>
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              setCurrentPage(1);
            }}
            className="text-xs font-semibold text-rose-500 hover:underline cursor-pointer"
          >
            Reset Search
          </button>
        )}
      </div>

      {/* Customers Table */}
      <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-slate-900/85 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`border-b text-xs font-bold uppercase tracking-wider ${
                darkMode ? 'border-slate-800 text-slate-400 bg-slate-800/80' : 'border-slate-200 text-slate-600 bg-slate-50'
              }`}>
                <th className={`p-3.5 sm:p-4 border-r last:border-r-0 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>Customer Code</th>
                <th className={`p-3.5 sm:p-4 border-r last:border-r-0 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>Company Name</th>
                <th className={`p-3.5 sm:p-4 border-r last:border-r-0 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>Contact Person</th>
                <th className={`p-3.5 sm:p-4 border-r last:border-r-0 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>Phone</th>
                <th className={`p-3.5 sm:p-4 border-r last:border-r-0 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>Email</th>
                <th className="p-3.5 sm:p-4">Sales Executive</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    <Building2 className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-50" />
                    <p className="font-semibold">No enterprise customers found</p>
                    <p className="text-[11px] mt-0.5">Register a new client account or adjust search parameters</p>
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map(c => (
                  <tr key={c.id} className={`transition-colors ${darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/80'}`}>
                    <td className={`p-3.5 sm:p-4 border-r last:border-r-0 font-mono font-bold text-blue-400 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                      {c.code}
                    </td>
                    <td className={`p-3.5 sm:p-4 border-r last:border-r-0 font-semibold ${darkMode ? 'border-slate-800 text-white' : 'border-slate-200 text-slate-900'}`}>
                      {c.name}
                    </td>
                    <td className={`p-3.5 sm:p-4 border-r last:border-r-0 text-slate-400 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                      {c.contactPerson || '-'}
                    </td>
                    <td className={`p-3.5 sm:p-4 border-r last:border-r-0 ${darkMode ? 'border-slate-800 text-slate-200' : 'border-slate-200 text-slate-800'}`}>
                      {c.phone || '-'}
                    </td>
                    <td className={`p-3.5 sm:p-4 border-r last:border-r-0 text-slate-400 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                      {c.email || '-'}
                    </td>
                    <td className="p-3.5 sm:p-4 font-semibold text-emerald-400">
                      {c.salesExecutive || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Standard ERP Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredCustomers.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
          darkMode={darkMode}
          itemName="customers"
        />
      </div>
    </div>
  );
};
