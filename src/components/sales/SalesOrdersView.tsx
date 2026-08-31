'use client';

import React, { useState } from 'react';
import { RefreshCw, Search, Filter, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { Pagination } from '../common/Pagination';

interface SalesOrdersViewProps {
  darkMode: boolean;
  orders: any[];
  onRefresh: () => void;
  onGoToLeads?: () => void;
  onGoToQuotations?: () => void;
}

export const SalesOrdersView: React.FC<SalesOrdersViewProps> = ({
  darkMode,
  orders,
  onRefresh,
  onGoToLeads,
  onGoToQuotations
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredOrders = (orders || [])
    .filter(o => statusFilter === 'All' || o.status === statusFilter)
    .filter(o =>
      !searchQuery ||
      (o.soNumber && o.soNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.customerPoNumber && o.customerPoNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.customerName && o.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.productName && o.productName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage));
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
      case 'Released to Production':
        return 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30';
      case 'In Production':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'Pending Planning':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'Dispatched':
      case 'Completed':
        return 'bg-teal-500/15 text-teal-400 border-teal-500/30';
      case 'Cancelled':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Confirmed Sales Orders & Planning
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Confirmed customer orders integrated with production planning, material requirements, and dispatch.
          </p>
        </div>
        <div>
          <button
            onClick={onRefresh}
            className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition-colors cursor-pointer ${
              darkMode ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by SO #, PO #, customer, product..."
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
              <option value="Confirmed">Confirmed</option>
              <option value="Released to Production">Released to Production</option>
              <option value="In Production">In Production</option>
              <option value="Pending Planning">Pending Planning</option>
              <option value="Dispatched">Dispatched</option>
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

      {/* Sales Orders Table */}
      <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-slate-900/85 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`border-b text-xs font-bold uppercase tracking-wider ${
                darkMode ? 'border-slate-800 text-slate-400 bg-slate-800/80' : 'border-slate-200 text-slate-600 bg-slate-50'
              }`}>
                <th className={`p-3.5 sm:p-4 border-r last:border-r-0 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>SO #</th>
                <th className={`p-3.5 sm:p-4 border-r last:border-r-0 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>Customer PO #</th>
                <th className={`p-3.5 sm:p-4 border-r last:border-r-0 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>Customer Name</th>
                <th className={`p-3.5 sm:p-4 border-r last:border-r-0 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>Product Specification</th>
                <th className={`p-3.5 sm:p-4 border-r last:border-r-0 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>Quantity</th>
                <th className={`p-3.5 sm:p-4 border-r last:border-r-0 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>Total Value (₹)</th>
                <th className={`p-3.5 sm:p-4 border-r last:border-r-0 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>Delivery Date</th>
                <th className="p-3.5 sm:p-4">Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white">No Confirmed Sales Orders Found</h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Sales orders are generated automatically when a customer enquiry/lead is marked as <strong>Won</strong> (after receiving their PO) and converted in the Lead Workflow Workspace.
                        </p>
                      </div>

                      <div className="pt-2 flex items-center justify-center gap-3">
                        {onGoToLeads && (
                          <button
                            onClick={onGoToLeads}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 cursor-pointer transition-all"
                          >
                            Go to Leads & Pipeline to Convert
                          </button>
                        )}
                        {onGoToQuotations && (
                          <button
                            onClick={onGoToQuotations}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold border cursor-pointer transition-colors ${
                              darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            View Quotations
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map(o => (
                  <tr key={o.id} className={`transition-colors ${darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/80'}`}>
                    <td className={`p-3.5 sm:p-4 border-r last:border-r-0 font-mono font-bold text-emerald-400 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                      {o.soNumber}
                    </td>
                    <td className={`p-3.5 sm:p-4 border-r last:border-r-0 font-mono font-semibold text-blue-400 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                      {o.customerPoNumber}
                    </td>
                    <td className={`p-3.5 sm:p-4 border-r last:border-r-0 font-semibold ${darkMode ? 'border-slate-800 text-white' : 'border-slate-200 text-slate-900'}`}>
                      {o.customerName}
                    </td>
                    <td className={`p-3.5 sm:p-4 border-r last:border-r-0 text-slate-400 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                      {o.productName}
                    </td>
                    <td className={`p-3.5 sm:p-4 border-r last:border-r-0 font-semibold ${darkMode ? 'border-slate-800 text-slate-200' : 'border-slate-200 text-slate-800'}`}>
                      {o.quantity.toLocaleString()} Pcs
                    </td>
                    <td className={`p-3.5 sm:p-4 border-r last:border-r-0 font-extrabold text-emerald-500 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                      ₹{o.totalValue.toLocaleString()}
                    </td>
                    <td className={`p-3.5 sm:p-4 border-r last:border-r-0 text-slate-400 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                      {o.deliveryDate}
                    </td>
                    <td className="p-3.5 sm:p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(o.status)}`}>
                        {o.status}
                      </span>
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
          totalItems={filteredOrders.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
          darkMode={darkMode}
          itemName="sales orders"
        />
      </div>
    </div>
  );
};
