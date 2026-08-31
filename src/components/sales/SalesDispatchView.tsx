'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Truck,
  Plus,
  RefreshCw,
  Search,
  Filter,
  FileText,
  Printer,
  X,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Package,
  Layers,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Download,
  AlertCircle
} from 'lucide-react';
import { Pagination } from '../common/Pagination';

interface SalesDispatchViewProps {
  darkMode: boolean;
  onRefreshParent?: () => void;
  onSelectModule?: (mod: string) => void;
  onNewDeliveryChallan?: () => void;
}

export const SalesDispatchView: React.FC<SalesDispatchViewProps> = ({
  darkMode,
  onRefreshParent,
  onSelectModule,
  onNewDeliveryChallan,
}) => {
  const router = useRouter();
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<any>(null);
  const [showPrintModal, setShowPrintModal] = useState<any>(null);
  const [showCancelModal, setShowCancelModal] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  // New Dispatch Form State
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [formData, setFormData] = useState({
    dispatchDate: new Date().toISOString().split('T')[0],
    dispatchTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    vehicleNumber: '',
    driverName: '',
    driverPhone: '',
    transporterName: '',
    lrNumber: '',
    lrDate: new Date().toISOString().split('T')[0],
    ewayBillNumber: '',
    shippingAddress: '',
    deliveryTerm: 'Ex-Factory',
    paymentTerms: '30 Days Net',
    dispatchedBy: 'Dispatch Supervisor',
    verifiedBy: 'Gate Security',
    remarks: '',
    inventoryUpdated: true,
    // Item dispatch fields
    dispatchedQuantity: 0,
    bundlesCount: 0,
    unitsPerBundle: 25,
    boxWeightKg: 0.45,
    totalWeightKg: 0,
    rate: 0,
  });

  const printRef = useRef<HTMLDivElement | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dispatchRes, pendingOrdersRes] = await Promise.all([
        fetch('/api/sales/dispatch').then((r) => r.json()),
        fetch('/api/sales/orders/pending-dispatch').then((r) => r.json()),
      ]);

      if (dispatchRes.success && dispatchRes.data) {
        setDispatches(dispatchRes.data);
      }
      if (pendingOrdersRes.success && pendingOrdersRes.data) {
        setPendingOrders(pendingOrdersRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch dispatch data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sync calculations on dispatch form changes
  const handleOrderSelection = (order: any) => {
    setSelectedOrder(order);
    const pendingQty = order.quantityPending ?? order.quantity ?? 1000;
    const defaultRate = order.unitPrice || 0;
    const defaultUnitsPerBundle = 25;
    const bundles = Math.ceil(pendingQty / defaultUnitsPerBundle);
    const weightPerBox = 0.45; // kg
    const totalWeight = Math.round(pendingQty * weightPerBox);

    setFormData((prev) => ({
      ...prev,
      dispatchedQuantity: pendingQty,
      rate: defaultRate,
      unitsPerBundle: defaultUnitsPerBundle,
      bundlesCount: bundles,
      boxWeightKg: weightPerBox,
      totalWeightKg: totalWeight,
      shippingAddress: order.shippingAddress || order.customer?.address || '',
      paymentTerms: order.paymentTerms || '30 Days Net',
    }));
  };

  const handleQtyChange = (qty: number) => {
    const unitsPerBundle = formData.unitsPerBundle || 25;
    const bundles = Math.ceil(qty / unitsPerBundle);
    const totalWeight = Math.round(qty * (formData.boxWeightKg || 0.45));

    setFormData((prev) => ({
      ...prev,
      dispatchedQuantity: qty,
      bundlesCount: bundles,
      totalWeightKg: totalWeight,
    }));
  };

  const handleCreateDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) {
      setActionError('Please select a Sales Order to dispatch');
      return;
    }
    if (!formData.vehicleNumber.trim()) {
      setActionError('Vehicle Number is required');
      return;
    }
    if (formData.dispatchedQuantity <= 0) {
      setActionError('Dispatched quantity must be greater than zero');
      return;
    }

    setActionLoading(true);
    setActionError('');

    try {
      const payload = {
        salesOrderId: selectedOrder.id,
        customerId: selectedOrder.customerId || undefined,
        customerName: selectedOrder.customerName,
        customerPoNumber: selectedOrder.customerPoNumber,
        warehouseId: selectedOrder.warehouseId || undefined,
        warehouseName: selectedOrder.warehouse?.name || 'Main FG Warehouse',
        dispatchDate: formData.dispatchDate,
        dispatchTime: formData.dispatchTime,
        vehicleNumber: formData.vehicleNumber.trim().toUpperCase(),
        driverName: formData.driverName || undefined,
        driverPhone: formData.driverPhone || undefined,
        transporterName: formData.transporterName || undefined,
        lrNumber: formData.lrNumber || undefined,
        lrDate: formData.lrDate || undefined,
        ewayBillNumber: formData.ewayBillNumber || undefined,
        shippingAddress: formData.shippingAddress || undefined,
        deliveryTerm: formData.deliveryTerm || 'Ex-Factory',
        paymentTerms: formData.paymentTerms || undefined,
        dispatchedBy: formData.dispatchedBy,
        verifiedBy: formData.verifiedBy,
        remarks: formData.remarks || undefined,
        inventoryUpdated: formData.inventoryUpdated,
        status: 'Dispatched',
        items: [
          {
            productId: selectedOrder.productId || undefined,
            productCode: selectedOrder.product?.code || 'FG-CORR',
            productName: selectedOrder.productName || 'Corrugated Box',
            orderedQuantity: selectedOrder.quantity,
            dispatchedQuantity: Number(formData.dispatchedQuantity),
            unit: 'Pcs',
            bundlesCount: Number(formData.bundlesCount),
            unitsPerBundle: Number(formData.unitsPerBundle),
            boxWeightKg: Number(formData.boxWeightKg),
            totalWeightKg: Number(formData.totalWeightKg),
            rate: Number(formData.rate),
            amount: Number(formData.dispatchedQuantity) * Number(formData.rate),
            remarks: formData.remarks,
          },
        ],
      };

      const res = await fetch('/api/sales/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || result.message || 'Failed to generate delivery challan');
      }

      setShowCreateModal(false);
      setSelectedOrder(null);
      await fetchData();
      if (onRefreshParent) onRefreshParent();
    } catch (err: any) {
      setActionError(err.message || 'Error creating dispatch');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/sales/dispatch/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await res.json();
      if (result.success) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleCancelDispatch = async () => {
    if (!showCancelModal) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/sales/dispatch/${showCancelModal.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await res.json();
      if (result.success) {
        setShowCancelModal(null);
        setCancelReason('');
        await fetchData();
        if (onRefreshParent) onRefreshParent();
      } else {
        alert(result.error || 'Failed to cancel dispatch');
      }
    } catch (err) {
      console.error('Error cancelling dispatch', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenPrint = async (dispatch: any) => {
    try {
      const res = await fetch(`/api/sales/dispatch/${dispatch.id}/print`);
      const result = await res.json();
      if (result.success && result.data) {
        setShowPrintModal(result.data);
      } else {
        setShowPrintModal(dispatch);
      }
    } catch {
      setShowPrintModal(dispatch);
    }
  };

  const executeBrowserPrint = () => {
    window.print();
  };

  // KPIs
  const totalDispatchesCount = dispatches.length;
  const totalDeliveredCount = dispatches.filter((d) => d.status === 'Delivered').length;
  const totalInTransitCount = dispatches.filter((d) => d.status === 'In Transit' || d.status === 'Dispatched' || d.status === 'Loaded').length;
  const totalQtyDispatched = dispatches
    .filter((d) => d.status !== 'Cancelled')
    .reduce((acc, d) => acc + (d.totalQuantity || 0), 0);
  const totalWeightTonnes = (
    dispatches
      .filter((d) => d.status !== 'Cancelled')
      .reduce((acc, d) => acc + (d.totalWeightKg || 0), 0) / 1000
  ).toFixed(2);

  // Filtered
  const filteredDispatches = dispatches
    .filter((d) => statusFilter === 'All' || d.status === statusFilter)
    .filter(
      (d) =>
        !searchQuery ||
        d.challanNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.soNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.vehicleNumber && d.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (d.transporterName && d.transporterName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (d.lrNumber && d.lrNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (d.ewayBillNumber && d.ewayBillNumber.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  const totalPages = Math.max(1, Math.ceil(filteredDispatches.length / itemsPerPage));
  const paginatedDispatches = filteredDispatches.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Dispatched':
      case 'In Transit':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'Loaded':
      case 'Ready for Dispatch':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
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
          <h1 className={`text-2xl font-extrabold tracking-tight flex items-center gap-2.5 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            <Truck className="w-7 h-7 text-emerald-500" />
            <span>Finished Goods Dispatch & Delivery Challans</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage outgoing delivery challans, vehicle dispatch logistics, e-Way bills, gate passes, and inventory deductions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition-colors cursor-pointer ${
              darkMode ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => {
              if (onNewDeliveryChallan) {
                onNewDeliveryChallan();
              } else {
                router.push('/sales/delivery-challans/new');
              }
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-2 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Delivery Challan</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Challans</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{totalDispatchesCount}</span>
            <span className="text-xs text-slate-400">Shipments</span>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">In Transit / Dispatched</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-400">{totalInTransitCount}</span>
            <span className="text-xs text-slate-400">On Road</span>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Delivered Successfully</span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-teal-400">{totalDeliveredCount}</span>
            <span className="text-xs text-slate-400">Completed</span>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Volume Dispatched</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{totalQtyDispatched.toLocaleString()}</span>
            <span className="text-xs text-amber-500 font-semibold font-mono">({totalWeightTonnes} MT)</span>
          </div>
        </div>
      </div>

      {/* Orders Ready for Dispatch Banner */}
      {pendingOrders.length > 0 && (
        <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          darkMode ? 'bg-gradient-to-r from-emerald-950/40 to-slate-900 border-emerald-800/40' : 'bg-emerald-50/70 border-emerald-200'
        }`}>
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-sm font-bold ${darkMode ? 'text-emerald-300' : 'text-emerald-900'}`}>
                {pendingOrders.length} Sales Orders Pending Dispatch
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Orders confirmed or completed from production waiting for delivery challan generation.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => {
                setShowCreateModal(true);
                handleOrderSelection(pendingOrders[0]);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Dispatch Next ({pendingOrders[0]?.soNumber})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Challan #, SO #, Customer, Vehicle, LR #..."
            value={searchQuery}
            onChange={(e) => {
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
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={`px-3 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <option value="All">All Statuses</option>
              <option value="Ready for Dispatch">Ready for Dispatch</option>
              <option value="Loaded">Loaded</option>
              <option value="Dispatched">Dispatched</option>
              <option value="In Transit">In Transit</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
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

      {/* Dispatches Table */}
      <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-slate-900/85 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`border-b text-xs font-bold uppercase tracking-wider ${
                darkMode ? 'border-slate-800 text-slate-400 bg-slate-800/80' : 'border-slate-200 text-slate-600 bg-slate-50'
              }`}>
                <th className={`p-3.5 sm:p-4 border-r last:border-r-0 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>Challan #</th>
                <th className={`p-3.5 sm:p-4 border-r last:border-r-0 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>Date & Time</th>
                <th className={`p-3.5 sm:p-4 border-r last:border-r-0 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>SO & Customer</th>
                <th className={`p-3.5 sm:p-4 border-r last:border-r-0 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>Vehicle & Transporter</th>
                <th className={`p-3.5 sm:p-4 border-r last:border-r-0 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>Quantity & Bundles</th>
                <th className={`p-3.5 sm:p-4 border-r last:border-r-0 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>Weight (Kg)</th>
                <th className={`p-3.5 sm:p-4 border-r last:border-r-0 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>Status</th>
                <th className="p-3.5 sm:p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
              {paginatedDispatches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500">
                    <Truck className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-50" />
                    <p className="font-semibold">No delivery challans found</p>
                    <p className="text-[11px] mt-0.5">Generate a new delivery challan or adjust filters</p>
                  </td>
                </tr>
              ) : (
                paginatedDispatches.map((d) => (
                  <tr key={d.id} className={`transition-colors ${darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/80'}`}>
                    <td className={`p-3.5 sm:p-4 border-r last:border-r-0 font-mono font-bold text-emerald-400 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                      {d.challanNumber}
                    </td>
                    <td className={`p-3.5 sm:p-4 border-r last:border-r-0 text-slate-400 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                      <div>{d.dispatchDate}</div>
                      {d.dispatchTime && <div className="text-[10px] text-slate-500">{d.dispatchTime}</div>}
                    </td>
                    <td className={`p-3.5 sm:p-4 border-r last:border-r-0 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                      <div className="font-semibold text-slate-200">{d.customerName}</div>
                      <div className="text-[10px] font-mono text-emerald-500">{d.soNumber} {d.customerPoNumber ? `(PO: ${d.customerPoNumber})` : ''}</div>
                    </td>
                    <td className={`p-3.5 sm:p-4 border-r last:border-r-0 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                      <div className="font-mono font-bold text-slate-300">{d.vehicleNumber}</div>
                      <div className="text-[10px] text-slate-500">{d.transporterName || 'Self / Local Transport'}</div>
                    </td>
                    <td className={`p-3.5 sm:p-4 border-r last:border-r-0 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                      <div className="font-bold text-emerald-400">{d.totalQuantity.toLocaleString()} Pcs</div>
                      <div className="text-[10px] text-slate-500">{d.totalBundles} Bundles</div>
                    </td>
                    <td className={`p-3.5 sm:p-4 border-r last:border-r-0 font-semibold ${darkMode ? 'border-slate-800 text-slate-300' : 'border-slate-200 text-slate-700'}`}>
                      {d.totalWeightKg.toLocaleString()} Kg
                    </td>
                    <td className={`p-3.5 sm:p-4 border-r last:border-r-0 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                      <select
                        value={d.status}
                        onChange={(e) => handleStatusChange(d.id, e.target.value)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-full border focus:outline-none cursor-pointer ${getStatusBadge(d.status)}`}
                      >
                        <option value="Ready for Dispatch">Ready for Dispatch</option>
                        <option value="Loaded">Loaded</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-3.5 sm:p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenPrint(d)}
                          title="Print Delivery Challan"
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            darkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-emerald-400' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-emerald-600'
                          }`}
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setShowDetailModal(d)}
                          title="View Details"
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            darkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-blue-400' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-blue-600'
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        {d.status !== 'Cancelled' && (
                          <button
                            onClick={() => setShowCancelModal(d)}
                            title="Cancel Dispatch & Reverse Stock"
                            className="p-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
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
          totalItems={filteredDispatches.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
          darkMode={darkMode}
          itemName="delivery challans"
        />
      </div>

      {/* CREATE DELIVERY CHALLAN MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className={`w-full max-w-3xl rounded-2xl border p-6 shadow-2xl transition-all my-8 ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Generate Delivery Challan & Dispatch</h3>
                  <p className="text-xs text-slate-500">Create official shipment document and deduct inventory</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleCreateDispatch} className="mt-4 space-y-4">
              {/* Sales Order Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Select Sales Order Pending Dispatch *
                </label>
                <select
                  value={selectedOrder?.id || ''}
                  onChange={(e) => {
                    const order = pendingOrders.find((o) => o.id === e.target.value);
                    if (order) handleOrderSelection(order);
                  }}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                  required
                >
                  {pendingOrders.map((order) => (
                    <option key={order.id} value={order.id}>
                      {order.soNumber} - {order.customerName} ({order.productName} | Pending: {order.quantityPending ?? order.quantity} Pcs)
                    </option>
                  ))}
                </select>
              </div>

              {/* Order Summary Pill */}
              {selectedOrder && (
                <div className={`p-3 rounded-xl border text-xs grid grid-cols-2 sm:grid-cols-4 gap-2 ${
                  darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Customer</span>
                    <strong className="text-emerald-400">{selectedOrder.customerName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Product</span>
                    <strong className="text-slate-300">{selectedOrder.productName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Total Ordered</span>
                    <strong className="text-slate-300">{selectedOrder.quantity.toLocaleString()} Pcs</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Pending to Dispatch</span>
                    <strong className="text-amber-400 font-mono">{(selectedOrder.quantityPending ?? selectedOrder.quantity).toLocaleString()} Pcs</strong>
                  </div>
                </div>
              )}

              {/* Dispatch Logistics Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Dispatch Date *</label>
                  <input
                    type="date"
                    value={formData.dispatchDate}
                    onChange={(e) => setFormData({ ...formData, dispatchDate: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Vehicle Number *</label>
                  <input
                    type="text"
                    placeholder="e.g. MH-04-AB-1234"
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Transporter Name</label>
                  <input
                    type="text"
                    placeholder="e.g. VRL Logistics / Direct"
                    value={formData.transporterName}
                    onChange={(e) => setFormData({ ...formData, transporterName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Driver Name</label>
                  <input
                    type="text"
                    placeholder="Driver full name"
                    value={formData.driverName}
                    onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Driver Phone #</label>
                  <input
                    type="text"
                    placeholder="10-digit mobile"
                    value={formData.driverPhone}
                    onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">LR / Bilty Number</label>
                  <input
                    type="text"
                    placeholder="LR-987654"
                    value={formData.lrNumber}
                    onChange={(e) => setFormData({ ...formData, lrNumber: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">e-Way Bill Number</label>
                  <input
                    type="text"
                    placeholder="12-digit e-Way bill # (if applicable)"
                    value={formData.ewayBillNumber}
                    onChange={(e) => setFormData({ ...formData, ewayBillNumber: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Delivery Terms</label>
                  <select
                    value={formData.deliveryTerm}
                    onChange={(e) => setFormData({ ...formData, deliveryTerm: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="Ex-Factory">Ex-Factory (Customer Arranges Transport)</option>
                    <option value="Door Delivery">Door Delivery (Freight Paid)</option>
                    <option value="To-Pay">To-Pay (Freight Paid by Consignee)</option>
                    <option value="FOR Destination">FOR Destination</option>
                  </select>
                </div>
              </div>

              {/* Quantity, Bundles & Weight Calculations */}
              <div className={`p-4 rounded-xl border space-y-3 ${darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Shipment Quantities & Packaging Breakdown</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Dispatched Qty (Pcs) *</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.dispatchedQuantity}
                      onChange={(e) => handleQtyChange(parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 rounded-xl border text-xs font-bold text-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                      }`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Units per Bundle</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.unitsPerBundle}
                      onChange={(e) => {
                        const upb = parseFloat(e.target.value) || 25;
                        const bundles = Math.ceil(formData.dispatchedQuantity / upb);
                        setFormData({ ...formData, unitsPerBundle: upb, bundlesCount: bundles });
                      }}
                      className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Calculated Bundles</label>
                    <input
                      type="number"
                      value={formData.bundlesCount}
                      onChange={(e) => setFormData({ ...formData, bundlesCount: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-xl border text-xs font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Total Net Weight (Kg)</label>
                    <input
                      type="number"
                      value={formData.totalWeightKg}
                      onChange={(e) => setFormData({ ...formData, totalWeightKg: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-xl border text-xs font-bold text-amber-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address & Remarks */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Consignee Shipping Address</label>
                <textarea
                  rows={2}
                  value={formData.shippingAddress}
                  onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                  placeholder="Complete factory/site delivery address"
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              {/* Inventory Auto Deduct Switch */}
              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-semibold">Automatically Deduct Stock from Finished Goods Warehouse</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.inventoryUpdated}
                  onChange={(e) => setFormData({ ...formData, inventoryUpdated: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className={`px-4 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                    darkMode ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-2 transition-all shadow-lg shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Truck className="w-3.5 h-3.5" />}
                  <span>Generate Delivery Challan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT DELIVERY CHALLAN MODAL */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-4xl rounded-2xl bg-white text-slate-900 p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
              <div className="flex items-center space-x-2">
                <Printer className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-800">Print Preview: Delivery Challan & Gate Pass</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={executeBrowserPrint}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 hover:bg-emerald-500 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => setShowPrintModal(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div ref={printRef} className="mt-6 border border-slate-300 p-6 rounded-lg text-xs leading-relaxed">
              {/* Company Header */}
              <div className="flex items-start justify-between border-b-2 border-slate-800 pb-4">
                <div>
                  <h1 className="text-xl font-black tracking-tight text-slate-900">AMK CORRUGATION & PACKAGING PVT. LTD.</h1>
                  <p className="text-[11px] text-slate-600">Plot No. 42-45, Industrial Area Phase II, Packaging Zone, Mumbai - 400093</p>
                  <p className="text-[11px] text-slate-600">GSTIN: <strong>27AABCA1234F1Z5</strong> | CIN: U21022MH2018PTC304891</p>
                  <p className="text-[11px] text-slate-600">Phone: +91 22 2847 9000 | Email: dispatch@amkpackaging.com</p>
                </div>
                <div className="text-right">
                  <div className="inline-block border-2 border-slate-900 px-3 py-1 font-black text-sm uppercase tracking-widest bg-slate-100">
                    DELIVERY CHALLAN
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">(Under Rule 55 of CGST Rules, 2017)</p>
                </div>
              </div>

              {/* Challan & Consignee Particulars */}
              <div className="grid grid-cols-2 gap-4 my-4 pb-4 border-b border-slate-200">
                <div className="space-y-1">
                  <p className="text-slate-500 font-bold uppercase text-[10px]">Consignee / Deliver To:</p>
                  <h4 className="font-extrabold text-sm text-slate-900">{showPrintModal.customer?.name || showPrintModal.customerName}</h4>
                  <p className="text-slate-600 text-[11px] whitespace-pre-line">{showPrintModal.customer?.shippingAddress || showPrintModal.shippingAddress || 'Factory Address'}</p>
                  <p className="text-slate-600 text-[11px]">Customer PO #: <strong>{showPrintModal.customer?.poNumber || showPrintModal.customerPoNumber || 'N/A'}</strong></p>
                </div>
                <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Challan No:</span>
                    <strong className="font-mono text-emerald-700">{showPrintModal.challan?.challanNumber || showPrintModal.challanNumber}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Challan Date:</span>
                    <strong>{showPrintModal.challan?.dispatchDate || showPrintModal.dispatchDate}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Sales Order No:</span>
                    <strong className="font-mono text-blue-700">{showPrintModal.customer?.soNumber || showPrintModal.soNumber}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Vehicle No:</span>
                    <strong className="font-mono">{showPrintModal.transport?.vehicleNumber || showPrintModal.vehicleNumber}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Transporter:</span>
                    <span>{showPrintModal.transport?.transporterName || showPrintModal.transporterName || 'Direct'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">e-Way Bill No:</span>
                    <span className="font-mono">{showPrintModal.challan?.ewayBillNumber || showPrintModal.ewayBillNumber || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Itemized Table */}
              <table className="w-full border-collapse border border-slate-300 text-[11px] my-4">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 font-bold">
                    <th className="border border-slate-300 p-2 text-center w-10">Sr.</th>
                    <th className="border border-slate-300 p-2 text-left">Description of Goods / Packaging Specification</th>
                    <th className="border border-slate-300 p-2 text-center">Bundles</th>
                    <th className="border border-slate-300 p-2 text-right">Quantity (Pcs)</th>
                    <th className="border border-slate-300 p-2 text-right">Weight (Kg)</th>
                    <th className="border border-slate-300 p-2 text-right">Rate (₹)</th>
                    <th className="border border-slate-300 p-2 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {(showPrintModal.items || []).map((it: any, idx: number) => (
                    <tr key={idx} className="border-b border-slate-200">
                      <td className="border border-slate-300 p-2 text-center">{idx + 1}</td>
                      <td className="border border-slate-300 p-2">
                        <strong>{it.productName}</strong>
                        {it.productCode && <span className="text-slate-500 ml-1">({it.productCode})</span>}
                      </td>
                      <td className="border border-slate-300 p-2 text-center">{it.bundles || it.bundlesCount || 0}</td>
                      <td className="border border-slate-300 p-2 text-right font-bold font-mono">{(it.dispatchedQty || it.dispatchedQuantity || 0).toLocaleString()}</td>
                      <td className="border border-slate-300 p-2 text-right font-mono">{(it.totalWeightKg || 0).toLocaleString()}</td>
                      <td className="border border-slate-300 p-2 text-right font-mono">₹{it.rate || 0}</td>
                      <td className="border border-slate-300 p-2 text-right font-bold font-mono">₹{(it.amount || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-extrabold border-t-2 border-slate-800">
                    <td colSpan={2} className="border border-slate-300 p-2 text-right uppercase">Total Dispatch Summary</td>
                    <td className="border border-slate-300 p-2 text-center">{showPrintModal.summary?.totalBundles || showPrintModal.totalBundles}</td>
                    <td className="border border-slate-300 p-2 text-right font-mono text-emerald-700">
                      {(showPrintModal.summary?.totalQuantity || showPrintModal.totalQuantity || 0).toLocaleString()} Pcs
                    </td>
                    <td className="border border-slate-300 p-2 text-right font-mono">
                      {(showPrintModal.summary?.totalWeightKg || showPrintModal.totalWeightKg || 0).toLocaleString()} Kg
                    </td>
                    <td className="border border-slate-300 p-2"></td>
                    <td className="border border-slate-300 p-2 text-right font-mono text-emerald-800">
                      ₹{(showPrintModal.summary?.totalAmount || 0).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Signatures & Footer */}
              <div className="grid grid-cols-3 gap-6 pt-12 mt-8 border-t border-slate-300 text-center text-[10px]">
                <div className="border-t border-slate-400 pt-2">
                  <p className="font-bold text-slate-800">Prepared & Dispatched By</p>
                  <p className="text-slate-500">Dispatch Executive / Warehouse</p>
                </div>
                <div className="border-t border-slate-400 pt-2">
                  <p className="font-bold text-slate-800">Security Gate Verified</p>
                  <p className="text-slate-500">Time Out & Odometer Checked</p>
                </div>
                <div className="border-t border-slate-400 pt-2">
                  <p className="font-bold text-slate-800">Receiver's Signature & Stamp</p>
                  <p className="text-slate-500">Acknowledged Good Condition</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL DISPATCH MODAL */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl transition-all ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center space-x-3 text-rose-500 mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold">Cancel Delivery Challan & Restore Stock?</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cancelling <strong>{showCancelModal.challanNumber}</strong> will restore <strong>{showCancelModal.totalQuantity} units</strong> back to finished goods stock, record a Stock In transaction, and reset the Sales Order pending quantity.
            </p>

            <div className="mt-4">
              <label className="block text-xs font-medium text-slate-400 mb-1">Reason for cancellation</label>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Transporter vehicle breakdown, order rescheduled by customer"
                className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setShowCancelModal(null)}
                className={`px-4 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                  darkMode ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleCancelDispatch}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-rose-600/20 transition-all cursor-pointer"
              >
                {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Cancellation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-2xl rounded-2xl border p-6 shadow-2xl transition-all ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold font-mono text-emerald-400">{showDetailModal.challanNumber}</h3>
                <p className="text-xs text-slate-500">Dispatch & Delivery Particulars</p>
              </div>
              <button
                onClick={() => setShowDetailModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-slate-500 block text-[10px]">Customer / Consignee</span>
                  <strong className="text-white text-sm">{showDetailModal.customerName}</strong>
                  <p className="text-slate-400 text-[11px] mt-1">{showDetailModal.shippingAddress || 'Factory Address'}</p>
                </div>
                <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-slate-500 block text-[10px]">Sales Order Reference</span>
                  <strong className="text-emerald-400 font-mono text-sm">{showDetailModal.soNumber}</strong>
                  <p className="text-slate-400 text-[11px] mt-1">Customer PO: {showDetailModal.customerPoNumber || 'N/A'}</p>
                </div>
              </div>

              <div className={`p-3 rounded-xl border grid grid-cols-3 gap-2 ${darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div>
                  <span className="text-slate-500 block text-[10px]">Vehicle No.</span>
                  <strong className="font-mono text-slate-200">{showDetailModal.vehicleNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Driver</span>
                  <strong className="text-slate-200">{showDetailModal.driverName || 'N/A'} ({showDetailModal.driverPhone || 'N/A'})</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Transporter</span>
                  <strong className="text-slate-200">{showDetailModal.transporterName || 'Self / Direct'}</strong>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => {
                    const item = showDetailModal;
                    setShowDetailModal(null);
                    handleOpenPrint(item);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Open Printable Challan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
