import React from 'react';
import { X, Calendar, User, FileText, Building2, Package, Tag, Info, AlertTriangle, Loader2 } from 'lucide-react';
import { RFQItem, Supplier } from '../../types';

interface RFQDetailViewProps {
  darkMode: boolean;
  rfq: RFQItem | null;
  loading: boolean;
  onClose: () => void;
  getSupplierDisplayName: (supplierId?: string, supplierName?: string, millName?: string, supplierObj?: any) => string;
}

export const RFQDetailView: React.FC<RFQDetailViewProps> = ({
  darkMode,
  rfq,
  loading,
  onClose,
  getSupplierDisplayName
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
        <p className="text-sm font-medium text-slate-500">Fetching RFQ details...</p>
      </div>
    );
  }

  if (!rfq) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-500" />
        <p className="text-sm font-medium text-slate-500">RFQ information not found.</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
        {/* Header Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center space-x-2 text-emerald-500 mb-1">
              <FileText className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">RFQ Identification</span>
            </div>
            <h3 className="text-xl font-black">{rfq.rfqNumber}</h3>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5" />
                <span>Date: {rfq.rfqDate}</span>
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-bold">Target: {rfq.deliveryDate}</span>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center space-x-2 text-indigo-500 mb-1">
              <Tag className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Status & Priority</span>
            </div>
            <div className="flex items-center space-x-3 mt-2">
              <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                rfq.status === 'Awarded' 
                  ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20' 
                  : 'bg-amber-500/15 text-amber-500 border-amber-500/20'
              }`}>
                {rfq.status}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                rfq.priority === 'High' 
                  ? 'bg-rose-500/15 text-rose-500 border-rose-500/20' 
                  : 'bg-blue-500/15 text-blue-500 border-blue-500/20'
              }`}>
                {rfq.priority} Priority
              </span>
            </div>
            <div className="mt-3 flex items-center space-x-1.5 text-[10px] text-slate-500 font-bold uppercase">
              <Building2 className="w-3 h-3" />
              <span>Dept: {rfq.department}</span>
            </div>
          </div>
        </div>

        {/* Suppliers Section */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-slate-400">
            <Building2 className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Invited Suppliers</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {rfq.suppliers.map((s, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded-xl border flex items-center space-x-3 ${darkMode ? 'bg-slate-800/20 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">{getSupplierDisplayName(s.supplierId, s.supplierName)}</p>
                  <p className="text-[10px] text-slate-500 truncate">{s.email || 'No email provided'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Materials Table */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-slate-400">
            <Package className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Requested Materials</h4>
          </div>
          <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b font-bold uppercase tracking-wider text-[10px] ${darkMode ? 'bg-slate-800 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                  <th className="p-3 w-12 text-center">#</th>
                  <th className="p-3">Material Code / Name</th>
                  <th className="p-3 text-right">Quantity</th>
                  <th className="p-3">Unit</th>
                  <th className="p-3">Required Date</th>
                  <th className="p-3">Expected Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {rfq.materials.map((mat, idx) => (
                  <tr key={idx} className={darkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                    <td className="p-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-700 dark:text-slate-300">{mat.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{mat.materialCode}</div>
                    </td>
                    <td className="p-3 text-right font-bold text-emerald-500">{mat.quantity.toLocaleString()}</td>
                    <td className="p-3 font-medium">{mat.unit}</td>
                    <td className="p-3 font-medium text-amber-500">{mat.requiredDate}</td>
                    <td className="p-3 font-mono font-bold">₹{mat.expectedPrice?.toLocaleString() || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Remarks Section */}
        {(rfq.description || rfq.remarks) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {rfq.description && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-slate-400">
                  <Info className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">RFQ Description</h4>
                </div>
                <div className={`p-4 rounded-xl border text-xs leading-relaxed ${darkMode ? 'bg-slate-800/30 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                  {rfq.description}
                </div>
              </div>
            )}
            {rfq.remarks && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-slate-400">
                  <Info className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">Internal Remarks</h4>
                </div>
                <div className={`p-4 rounded-xl border text-xs leading-relaxed ${darkMode ? 'bg-slate-800/30 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                  {rfq.remarks}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="pt-6 border-t border-slate-800/40 flex flex-wrap gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">
          <div className="flex items-center space-x-2">
            <User className="w-3.5 h-3.5" />
            <span>Created By: Administrator</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Created At: {rfq.createdAt ? new Date(rfq.createdAt).toLocaleString() : rfq.rfqDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
