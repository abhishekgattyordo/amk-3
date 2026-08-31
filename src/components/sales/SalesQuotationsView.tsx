'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, RefreshCw, X, Search, Filter, FileText, Eye } from 'lucide-react';
import { Pagination } from '../common/Pagination';

interface SalesQuotationsViewProps {
  darkMode: boolean;
  quotations: any[];
  onRefresh: () => void;
  onNewQuotation?: () => void;
  onSelectQuotation?: (quotation: any) => void;
  showAddQuoteModal?: boolean;
  setShowAddQuoteModal?: (show: boolean) => void;
  quoteForm?: any;
  setQuoteForm?: (form: any) => void;
  handleCreateQuotation?: (e: React.FormEvent) => void;
}

export const SalesQuotationsView: React.FC<SalesQuotationsViewProps> = ({
  darkMode,
  quotations,
  onRefresh,
  onNewQuotation,
  onSelectQuotation
}) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleOpenNewQuotation = () => {
    if (onNewQuotation) {
      onNewQuotation();
    } else {
      router.push('/sales/quotations/new');
    }
  };

  const filteredQuotations = (quotations || [])
    .filter(q => statusFilter === 'All' || q.status === statusFilter)
    .filter(q =>
      !searchQuery ||
      (q.quotationNumber && q.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (q.customerName && q.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (q.productName && q.productName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  const totalPages = Math.max(1, Math.ceil(filteredQuotations.length / itemsPerPage));
  const paginatedQuotes = filteredQuotations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
      case 'Accepted':
        return 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30';
      case 'Draft':
        return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
      case 'Sent':
      case 'Active':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'Under Revision':
      case 'Pending':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'Rejected':
      case 'Expired':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default:
        return 'bg-teal-500/15 text-teal-400 border-teal-500/30';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Sales Quotations & Revisions
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage formal customer proposals, pricing breakdowns, revisions, and quotation validity tracking.
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
            onClick={handleOpenNewQuotation}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Quotation</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by quote #, customer, product..."
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
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={e => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={`px-3 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <option value="All">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Approved">Approved</option>
              <option value="Under Revision">Under Revision</option>
            </select>
          </div>
          {(searchQuery || statusFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('All');
                setCurrentPage(1);
              }}
              className="text-xs font-semibold text-rose-500 hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Quotations Table */}
      <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-slate-900/85 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`border-b text-xs font-bold uppercase tracking-wider ${
                darkMode ? 'border-slate-800 text-slate-400 bg-slate-800/80' : 'border-slate-200 text-slate-600 bg-slate-50'
              }`}>
                <th className={`p-3.5 sm:p-4 border-r last:border-r-0 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>Quotation #</th>
                <th className={`p-3.5 sm:p-4 border-r last:border-r-0 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>Customer Name</th>
                <th className={`p-3.5 sm:p-4 border-r last:border-r-0 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>Product Specification</th>
                <th className={`p-3.5 sm:p-4 border-r last:border-r-0 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>Revision</th>
                <th className={`p-3.5 sm:p-4 border-r last:border-r-0 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>Amount (₹)</th>
                <th className={`p-3.5 sm:p-4 border-r last:border-r-0 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>Valid Until</th>
                <th className={`p-3.5 sm:p-4 border-r last:border-r-0 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>Status</th>
                <th className="p-3.5 sm:p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
              {paginatedQuotes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500">
                    <FileText className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-50" />
                    <p className="font-semibold">No sales quotations found</p>
                    <p className="text-[11px] mt-0.5">Create a quotation or adjust your search filters</p>
                  </td>
                </tr>
              ) : (
                paginatedQuotes.map(q => (
                  <tr key={q.id} className={`transition-colors ${darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/80'}`}>
                    <td className={`p-3.5 sm:p-4 border-r last:border-r-0 font-mono font-bold text-teal-400 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                      <button
                        onClick={() => {
                          if (onSelectQuotation) {
                            onSelectQuotation(q);
                          } else {
                            router.push(`/sales/quotations/${q.id}`);
                          }
                        }}
                        className="hover:underline text-teal-400 font-bold font-mono cursor-pointer flex items-center space-x-1 text-left"
                        title="Open Quotation Workspace"
                      >
                        <span>{q.quotationNumber}</span>
                      </button>
                    </td>
                    <td className={`p-3.5 sm:p-4 border-r last:border-r-0 font-semibold ${darkMode ? 'border-slate-800 text-white' : 'border-slate-200 text-slate-900'}`}>
                      {q.customerName}
                    </td>
                    <td className={`p-3.5 sm:p-4 border-r last:border-r-0 text-slate-400 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                      {q.productName}
                    </td>
                    <td className={`p-3.5 sm:p-4 border-r last:border-r-0 font-semibold ${darkMode ? 'border-slate-800 text-slate-200' : 'border-slate-200 text-slate-800'}`}>
                      Rev {q.revision}
                    </td>
                    <td className={`p-3.5 sm:p-4 border-r last:border-r-0 font-extrabold text-emerald-500 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                      ₹{q.amount.toLocaleString()}
                    </td>
                    <td className={`p-3.5 sm:p-4 border-r last:border-r-0 text-slate-400 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                      {q.validUntil}
                    </td>
                    <td className={`p-3.5 sm:p-4 border-r last:border-r-0 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(q.status)}`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="p-3.5 sm:p-4 text-right">
                      <button
                        onClick={() => {
                          if (onSelectQuotation) {
                            onSelectQuotation(q);
                          } else {
                            router.push(`/sales/quotations/${q.id}`);
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-600/15 text-teal-400 hover:bg-teal-600 hover:text-white border border-teal-500/20 transition-all cursor-pointer inline-flex items-center space-x-1.5 shadow-sm"
                        title="Open full Quotation Workspace separate page"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Workspace</span>
                      </button>
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
          totalItems={filteredQuotations.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
          darkMode={darkMode}
          itemName="quotations"
        />
      </div>
    </div>
  );
};
