import React, { useState, useMemo } from 'react';
import { Plus, ArrowUp, ArrowDown, X, Copy, Trash2, Search, Check, Building2 } from 'lucide-react';
import { DatePicker } from '../common/DatePicker';
import { ServerSearchableDropdown } from '../common/ServerSearchableDropdown';
import { RawMaterial, Supplier } from '../../types';

interface RFQFormProps {
  newRfq: any;
  setNewRfq: (rfq: any) => void;
  rfqItems: any[];
  setRfqItems: (items: any[]) => void;
  suppliers: Supplier[];
  darkMode: boolean;
  handleAddRfqItem: () => void;
  handleUpdateRfqItem: (index: number, field: string, value: any) => void;
  handleMoveRfqItem: (index: number, direction: 'up' | 'down') => void;
  handleRemoveRfqItem: (index: number) => void;
  handleDuplicateRfqItem: (index: number) => void;
  allowDuplicateMaterials: boolean;
  setAllowDuplicateMaterials: (val: boolean) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

export const RFQForm: React.FC<RFQFormProps> = ({
  newRfq, setNewRfq, rfqItems, setRfqItems, suppliers, darkMode,
  handleAddRfqItem, handleUpdateRfqItem, handleMoveRfqItem, handleRemoveRfqItem,
  handleDuplicateRfqItem, allowDuplicateMaterials, setAllowDuplicateMaterials, handleSubmit
}) => {
  const selectedSuppliers = newRfq.selectedSuppliers || [];
  const setSelectedSuppliers = (ids: string[]) => setNewRfq({...newRfq, selectedSuppliers: ids});

  const [supplierSearchQuery, setSupplierSearchQuery] = useState('');

  const filteredSuppliers = useMemo(() => {
    if (!supplierSearchQuery.trim()) return suppliers;
    const q = supplierSearchQuery.trim().toLowerCase();
    return suppliers.filter(s => 
      (s.supplierName || '').toLowerCase().includes(q) ||
      ((s as any).supplierCode || '').toLowerCase().includes(q) ||
      ((s as any).millName || '').toLowerCase().includes(q)
    );
  }, [suppliers, supplierSearchQuery]);

  const selectedSupplierObjects = useMemo(() => {
    return suppliers.filter(s => selectedSuppliers.includes(s.id));
  }, [suppliers, selectedSuppliers]);

  return (
    <form onSubmit={handleSubmit} className="space-y-5 overflow-y-auto pr-1 flex-1">
      {/* Header Details */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 rounded-2xl border bg-slate-500/5 border-slate-800/20">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1">Originating Department</label>
          <select value={newRfq.department} onChange={(e) => setNewRfq({ ...newRfq, department: e.target.value })} className={`w-full px-3 py-2 rounded-xl border text-xs ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}>
            <option value="Production">Production Plant</option>
            <option value="Adhesives">Adhesives Dept</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1">Priority Level</label>
          <select value={newRfq.priority} onChange={(e) => setNewRfq({ ...newRfq, priority: e.target.value as any })} className={`w-full px-3 py-2 rounded-xl border text-xs ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High Priority</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1">Default Target Delivery Date</label>
          <DatePicker
            value={newRfq.deliveryDate}
            onChange={(date) => setNewRfq({ ...newRfq, deliveryDate: date })}
            darkMode={darkMode}
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1">RFQ Brief Description</label>
          <input type="text" value={newRfq.description} onChange={(e) => setNewRfq({ ...newRfq, description: e.target.value })} placeholder="e.g., Raw material replenishment for Box Line 2" className={`w-full px-3 py-2 rounded-xl border text-xs ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`} />
        </div>
      </div>

      {/* Dynamic Line-Item Table */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <div className="flex items-center space-x-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 flex items-center gap-1.5">
                    Requested Raw Materials Line Items
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                    {rfqItems.length} {rfqItems.length === 1 ? 'Item' : 'Items'}
                </span>
            </div>
            <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-1.5 text-xs text-slate-700 dark:text-slate-400 cursor-pointer select-none">
                    <input type="checkbox" checked={allowDuplicateMaterials} onChange={(e) => setAllowDuplicateMaterials(e.target.checked)} className="rounded accent-emerald-600" />
                    <span>Allow duplicate materials</span>
                </label>
                <button
                    type="button"
                    onClick={handleAddRfqItem}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow flex items-center space-x-1 cursor-pointer transition-all"
                >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Raw Material Item</span>
                </button>
            </div>
        </div>

        <div className={`rounded-2xl border overflow-x-auto ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`border-b font-bold uppercase tracking-wider text-[10px] ${darkMode ? 'bg-slate-800/80 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                <th className="p-2.5 w-12 text-center">#</th>
                <th className="p-2.5 min-w-[180px]">Raw Material *</th>
                <th className="p-2.5 min-w-[150px]">Description</th>
                <th className="p-2.5 w-20">Unit</th>
                <th className="p-2.5 w-28">Quantity *</th>
                <th className="p-2.5 w-28">Expected Price (₹)</th>
                <th className="p-2.5 w-32">Req. Delivery Date</th>
                <th className="p-2.5 min-w-[120px]">Remarks</th>
                <th className="p-2.5 w-24 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {rfqItems.map((item, index) => (
                <tr key={index} className={`hover:bg-slate-500/5 transition-colors`}>
                  <td className="p-2 text-center font-mono text-[10px] text-slate-700 dark:text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-0.5">
                        <span>{index + 1}</span>
                        <div className="flex items-center space-x-0.5">
                            <button type="button" disabled={index === 0} onClick={() => handleMoveRfqItem(index, 'up')} className="p-0.5 rounded hover:bg-slate-700/50 text-slate-700 dark:text-slate-400 disabled:opacity-20 cursor-pointer"><ArrowUp className="w-2.5 h-2.5" /></button>
                            <button type="button" disabled={index === rfqItems.length - 1} onClick={() => handleMoveRfqItem(index, 'down')} className="p-0.5 rounded hover:bg-slate-700/50 text-slate-700 dark:text-slate-400 disabled:opacity-20 cursor-pointer"><ArrowDown className="w-2.5 h-2.5" /></button>
                        </div>
                      </div>
                  </td>
                  <td className="p-2">
                    <ServerSearchableDropdown
                      darkMode={darkMode}
                      value={item.materialId || ''}
                      onChange={(id, mat) => handleUpdateRfqItem(index, 'materialId', mat?.id)}
                      placeholder="Search material..."
                    />
                  </td>
                  <td className="p-2"><input type="text" value={item.description} onChange={(e) => handleUpdateRfqItem(index, 'description', e.target.value)} className={`w-full px-2 py-1.5 rounded-lg border text-xs ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} /></td>
                  <td className="p-2"><input type="text" value={item.unit} onChange={(e) => handleUpdateRfqItem(index, 'unit', e.target.value)} className={`w-full px-2 py-1.5 rounded-lg border text-xs ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} /></td>
                  <td className="p-2"><input type="number" value={item.quantity || ''} onChange={(e) => handleUpdateRfqItem(index, 'quantity', Number(e.target.value))} className={`w-full px-2 py-1.5 rounded-lg border text-xs ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} /></td>
                  <td className="p-2"><input type="number" value={item.expectedPrice ?? ''} onChange={(e) => handleUpdateRfqItem(index, 'expectedPrice', e.target.value ? Number(e.target.value) : undefined)} className={`w-full px-2 py-1.5 rounded-lg border text-xs ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} /></td>
                  <td className="p-2">
                    <input type="date" value={item.requiredDate || newRfq.deliveryDate} onChange={(e) => handleUpdateRfqItem(index, 'requiredDate', e.target.value)} className={`w-full px-1.5 py-1.5 rounded-lg border text-[11px] ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} />
                  </td>
                  <td className="p-2"><input type="text" value={item.remarks} onChange={(e) => handleUpdateRfqItem(index, 'remarks', e.target.value)} className={`w-full px-2 py-1.5 rounded-lg border text-xs ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} /></td>
                  <td className="p-2 text-center">
                    <div className="flex items-center justify-center space-x-1">
                        <button type="button" onClick={() => handleDuplicateRfqItem(index)} className="p-1 rounded-lg hover:bg-slate-700/50 text-slate-700 dark:text-slate-400 hover:text-white transition-colors cursor-pointer"><Copy className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={() => handleRemoveRfqItem(index)} className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-700 dark:text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Suppliers Search and Select */}
      <div className="space-y-3">
         <div className="flex items-center justify-between">
           <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 flex items-center space-x-2">
             <Building2 className="w-4 h-4 text-emerald-500" />
             <span>Target Suppliers ({selectedSuppliers.length} Selected)</span>
           </label>
           {selectedSuppliers.length > 0 && (
             <button
               type="button"
               onClick={() => setSelectedSuppliers([])}
               className="text-[11px] text-rose-500 hover:underline font-semibold"
             >
               Clear All
             </button>
           )}
         </div>

         {/* Selected Suppliers Chips */}
         {selectedSupplierObjects.length > 0 && (
           <div className="flex flex-wrap gap-1.5 p-3 rounded-xl border bg-emerald-500/5 border-emerald-500/20">
             {selectedSupplierObjects.map(s => (
               <span key={s.id} className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-semibold shadow-sm">
                 <span>{s.supplierName}</span>
                 <button
                   type="button"
                   onClick={() => setSelectedSuppliers(selectedSuppliers.filter(id => id !== s.id))}
                   className="hover:bg-emerald-700 p-0.5 rounded-full transition-colors"
                 >
                   <X className="w-3 h-3" />
                 </button>
               </span>
             ))}
           </div>
         )}

         {/* Search & Scrollable Select Box */}
         <div className={`rounded-2xl border p-3 space-y-3 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
           <div className="relative">
             <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input
               type="text"
               value={supplierSearchQuery}
               onChange={(e) => setSupplierSearchQuery(e.target.value)}
               placeholder="Search suppliers by name, code or mill..."
               className={`w-full pl-9 pr-8 py-2 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                 darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
               }`}
             />
             {supplierSearchQuery && (
               <button
                 type="button"
                 onClick={() => setSupplierSearchQuery('')}
                 className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
               >
                 <X className="w-3.5 h-3.5" />
               </button>
             )}
           </div>

           <div className="max-h-48 overflow-y-auto space-y-1 pr-1 divide-y divide-slate-800/20">
             {filteredSuppliers.length === 0 ? (
               <div className="text-center py-6 text-xs text-slate-400">
                 No suppliers found matching "{supplierSearchQuery}"
               </div>
             ) : (
               filteredSuppliers.map(s => {
                 const isSelected = selectedSuppliers.includes(s.id);
                 return (
                   <div
                     key={s.id}
                     onClick={() => {
                       if (isSelected) {
                         setSelectedSuppliers(selectedSuppliers.filter(id => id !== s.id));
                       } else {
                         setSelectedSuppliers([...selectedSuppliers, s.id]);
                       }
                     }}
                     className={`flex items-center justify-between p-2 rounded-xl cursor-pointer text-xs transition-colors ${
                       isSelected
                         ? (darkMode ? 'bg-emerald-950/40 text-emerald-300 font-semibold' : 'bg-emerald-50 text-emerald-900 font-semibold')
                         : (darkMode ? 'hover:bg-slate-800/60 text-slate-300' : 'hover:bg-slate-50 text-slate-700')
                     }`}
                   >
                     <div className="flex items-center space-x-2">
                       <input
                         type="checkbox"
                         checked={isSelected}
                         onChange={() => {}}
                         className="rounded accent-emerald-600 pointer-events-none"
                       />
                       <span>{s.supplierName}</span>
                       {s.supplierCode && (
                         <span className="font-mono text-[10px] text-slate-400">({s.supplierCode})</span>
                       )}
                     </div>
                     {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                   </div>
                 );
               })
             )}
           </div>
         </div>
      </div>

      <div className="flex justify-end pt-3">
        <button type="submit" className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all cursor-pointer">
          Submit Request for Quotation (RFQ)
        </button>
      </div>
    </form>
  );
};