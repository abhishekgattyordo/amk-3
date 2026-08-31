'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Truck,
  Building2,
  Package,
  Calendar,
  Clock,
  Phone,
  User,
  MapPin,
  Layers,
  CheckCircle2,
  AlertCircle,
  Home,
  ChevronRight,
  Check,
  ShieldCheck,
  FileText,
  Boxes,
  Scale
} from 'lucide-react';

interface NewDeliveryChallanPageProps {
  darkMode: boolean;
  onBack?: () => void;
  onSuccess?: () => void;
}

export const NewDeliveryChallanPage: React.FC<NewDeliveryChallanPageProps> = ({
  darkMode,
  onBack,
  onSuccess
}) => {
  const router = useRouter();

  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [loadingOrders, setLoadingOrders] = useState(true);

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

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/sales/orders/pending-dispatch');
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setPendingOrders(data.data);
        handleSelectOrder(data.data[0]);
      } else {
        // Fallback to all orders
        const allRes = await fetch('/api/sales/orders');
        const allData = await allRes.json();
        if (allData.success && Array.isArray(allData.data)) {
          setPendingOrders(allData.data);
          if (allData.data.length > 0) {
            handleSelectOrder(allData.data[0]);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load pending orders', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSelectOrder = (order: any) => {
    setSelectedOrder(order);
    const pendingQty = order.quantityPending ?? order.quantity ?? 1000;
    const defaultRate = order.unitPrice || 45;
    const defaultUnitsPerBundle = 25;
    const bundles = Math.ceil(pendingQty / defaultUnitsPerBundle);
    const weightPerBox = 0.45;
    const totalWeight = Math.round(pendingQty * weightPerBox);

    setFormData(prev => ({
      ...prev,
      dispatchedQuantity: pendingQty,
      rate: defaultRate,
      unitsPerBundle: defaultUnitsPerBundle,
      bundlesCount: bundles,
      boxWeightKg: weightPerBox,
      totalWeightKg: totalWeight,
      shippingAddress: order.shippingAddress || order.customer?.address || '',
      paymentTerms: order.paymentTerms || '30 Days Net'
    }));
  };

  const handleQtyChange = (qty: number) => {
    const unitsPerBundle = formData.unitsPerBundle || 25;
    const bundles = Math.ceil(qty / unitsPerBundle);
    const totalWeight = Math.round(qty * (formData.boxWeightKg || 0.45));

    setFormData(prev => ({
      ...prev,
      dispatchedQuantity: qty,
      bundlesCount: bundles,
      totalWeightKg: totalWeight
    }));
  };

  const handleNavigateBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push('/sales_dispatch');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!selectedOrder) {
      setErrorMessage('Please select a Sales Order to dispatch.');
      return;
    }
    if (!formData.vehicleNumber.trim()) {
      setErrorMessage('Vehicle Number is required.');
      return;
    }
    if (formData.dispatchedQuantity <= 0) {
      setErrorMessage('Dispatched quantity must be greater than zero.');
      return;
    }

    setSubmitting(true);

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
            weightKg: Number(formData.totalWeightKg),
            rate: Number(formData.rate),
            amount: Number(formData.dispatchedQuantity) * Number(formData.rate),
          }
        ]
      };

      const res = await fetch('/api/sales/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success) {
        setSuccessMessage(`Delivery Challan "${data.data?.challanNumber || 'Generated'}" created & inventory updated successfully!`);
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else if (onBack) {
            onBack();
          } else {
            router.push('/sales_dispatch');
          }
        }, 800);
      } else {
        setErrorMessage(data.error || 'Failed to generate delivery challan. Please check stock levels and form inputs.');
      }
    } catch (err: any) {
      console.error('Error creating delivery challan:', err);
      setErrorMessage(err.message || 'An unexpected error occurred while generating the delivery challan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1 hover:text-emerald-500 transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button
          onClick={() => router.push('/sales_dashboard')}
          className="hover:text-emerald-500 transition-colors"
        >
          Sales Module
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button
          onClick={handleNavigateBack}
          className="hover:text-emerald-500 transition-colors"
        >
          Delivery Challans
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-semibold text-slate-700 dark:text-slate-300">New Delivery Challan</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-3.5">
          <button
            onClick={handleNavigateBack}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              darkMode
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-sm'
            }`}
            title="Return to Delivery Challans"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-2xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Generate Delivery Challan & Dispatch
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                Outward Gate Pass & Challan
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Issue official transport document, deduct finished goods from warehouse stock, and log transporter details.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleNavigateBack}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
              darkMode
                ? 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !selectedOrder}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating Challan...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Issue Delivery Challan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Select Sales Order */}
        <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h2 className={`text-sm font-bold uppercase tracking-wider ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                1. Select Sales Order Pending Dispatch
              </h2>
              <p className="text-[11px] text-slate-500">Pick an active sales order to fulfil with this consignment.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Target Sales Order <span className="text-rose-500">*</span>
              </label>
              {loadingOrders ? (
                <div className="p-3 text-xs text-slate-400 flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <span>Loading pending orders...</span>
                </div>
              ) : pendingOrders.length === 0 ? (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs">
                  No sales orders currently pending dispatch. Please confirm or create a Sales Order first.
                </div>
              ) : (
                <select
                  value={selectedOrder?.id || ''}
                  onChange={e => {
                    const order = pendingOrders.find(o => o.id === e.target.value);
                    if (order) handleSelectOrder(order);
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                  required
                >
                  {pendingOrders.map(order => (
                    <option key={order.id} value={order.id}>
                      {order.soNumber} — {order.customerName} ({order.productName} | Pending: {order.quantityPending ?? order.quantity} Pcs)
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Selected Order Summary Card */}
            {selectedOrder && (
              <div className={`p-4 rounded-xl border text-xs grid grid-cols-2 sm:grid-cols-4 gap-4 ${
                darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Client Account</span>
                  <strong className="text-emerald-500 text-sm mt-0.5 block">{selectedOrder.customerName}</strong>
                  <span className="text-[11px] text-slate-400">PO Ref: {selectedOrder.customerPoNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Carton Item</span>
                  <strong className="text-slate-800 dark:text-slate-200 text-sm mt-0.5 block">{selectedOrder.productName}</strong>
                  <span className="text-[11px] text-slate-400">Code: {selectedOrder.product?.code || 'FG-CORR'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Order Qty</span>
                  <strong className="text-slate-800 dark:text-slate-200 text-sm mt-0.5 block font-mono">
                    {selectedOrder.quantity?.toLocaleString()} Pcs
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Pending to Dispatch</span>
                  <strong className="text-amber-500 text-sm mt-0.5 block font-mono font-extrabold">
                    {(selectedOrder.quantityPending ?? selectedOrder.quantity)?.toLocaleString()} Pcs
                  </strong>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Logistics & Transporter Details */}
        <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h2 className={`text-sm font-bold uppercase tracking-wider ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                2. Transport, Vehicle & Gate Information
              </h2>
              <p className="text-[11px] text-slate-500">Provide vehicle registration number, driver details, and transporter documentation.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Dispatch Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  required
                  value={formData.dispatchDate}
                  onChange={e => setFormData({ ...formData, dispatchDate: e.target.value })}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Dispatch Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. 14:30"
                  value={formData.dispatchTime}
                  onChange={e => setFormData({ ...formData, dispatchTime: e.target.value })}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Vehicle Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Truck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. MH-04-AB-1234"
                  value={formData.vehicleNumber}
                  onChange={e => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-bold uppercase border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Transporter Name
              </label>
              <input
                type="text"
                placeholder="e.g. VRL Logistics / TCI Freight / Own Truck"
                value={formData.transporterName}
                onChange={e => setFormData({ ...formData, transporterName: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Driver Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Ramesh Yadav"
                  value={formData.driverName}
                  onChange={e => setFormData({ ...formData, driverName: e.target.value })}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Driver Contact Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={formData.driverPhone}
                  onChange={e => setFormData({ ...formData, driverPhone: e.target.value })}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                LR / Bilty Number
              </label>
              <input
                type="text"
                placeholder="e.g. LR/2026/0942"
                value={formData.lrNumber}
                onChange={e => setFormData({ ...formData, lrNumber: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-mono border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                E-Way Bill Number
              </label>
              <input
                type="text"
                placeholder="e.g. 5410 9821 0034"
                value={formData.ewayBillNumber}
                onChange={e => setFormData({ ...formData, ewayBillNumber: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-mono border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Delivery Term
              </label>
              <select
                value={formData.deliveryTerm}
                onChange={e => setFormData({ ...formData, deliveryTerm: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <option value="Ex-Factory">Ex-Factory</option>
                <option value="FOR Destination">FOR Destination</option>
                <option value="Customer Pick-up">Customer Pick-up</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Quantity & Packaging Load */}
        <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
              <Boxes className="w-4 h-4" />
            </div>
            <div>
              <h2 className={`text-sm font-bold uppercase tracking-wider ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                3. Quantity, Bundling & Weight Calibration
              </h2>
              <p className="text-[11px] text-slate-500">Calculate package bundles count and total gross payload weight.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Dispatched Quantity (Pcs) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                value={formData.dispatchedQuantity}
                onChange={e => handleQtyChange(parseInt(e.target.value) || 0)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-extrabold text-emerald-500 border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                  darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Units Per Bundle
              </label>
              <input
                type="number"
                min={1}
                value={formData.unitsPerBundle}
                onChange={e => {
                  const u = parseInt(e.target.value) || 25;
                  const b = Math.ceil(formData.dispatchedQuantity / u);
                  setFormData({ ...formData, unitsPerBundle: u, bundlesCount: b });
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-mono border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Total Bundles Count
              </label>
              <div className="relative">
                <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  value={formData.bundlesCount}
                  onChange={e => setFormData({ ...formData, bundlesCount: parseInt(e.target.value) || 0 })}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-bold border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Est. Total Weight (Kg)
              </label>
              <div className="relative">
                <Scale className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  value={formData.totalWeightKg}
                  onChange={e => setFormData({ ...formData, totalWeightKg: parseFloat(e.target.value) || 0 })}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-bold border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Delivery / Unloading Site Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <textarea
                  rows={2}
                  placeholder="e.g. Unit 4, Plant Logistics Dock, Industrial Area Phase 2, Pune"
                  value={formData.shippingAddress}
                  onChange={e => setFormData({ ...formData, shippingAddress: e.target.value })}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Inventory & Verification */}
        <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className={`text-sm font-bold uppercase tracking-wider ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                4. Gate Security, Quality Verification & Stock Ledger
              </h2>
              <p className="text-[11px] text-slate-500">Sign off on dispatch authority and sync inventory transactions.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
              <input
                type="checkbox"
                id="inventoryUpdated"
                checked={formData.inventoryUpdated}
                onChange={e => setFormData({ ...formData, inventoryUpdated: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <div>
                <label htmlFor="inventoryUpdated" className="text-xs sm:text-sm font-bold text-emerald-500 cursor-pointer block">
                  Automatically Deduct Finished Goods Stock from Main Warehouse
                </label>
                <p className="text-[11px] text-slate-400">
                  Deducts {formData.dispatchedQuantity.toLocaleString()} units of {selectedOrder?.productName || 'FG'} from inventory ledger.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Dispatched By (Signatory)
                </label>
                <input
                  type="text"
                  value={formData.dispatchedBy}
                  onChange={e => setFormData({ ...formData, dispatchedBy: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Gate Security & Verification Officer
                </label>
                <input
                  type="text"
                  value={formData.verifiedBy}
                  onChange={e => setFormData({ ...formData, verifiedBy: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Dispatch Remarks / Gate Pass Notes
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Inspected at Gate 2. All 40 bundles shrink-wrapped and strapped on wooden pallets."
                value={formData.remarks}
                onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                className={`w-full p-3.5 rounded-xl text-xs sm:text-sm border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                  darkMode
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={handleNavigateBack}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer text-center ${
              darkMode
                ? 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm'
            }`}
          >
            Cancel and Return
          </button>
          <button
            type="submit"
            disabled={submitting || !selectedOrder}
            className="w-full sm:w-auto px-7 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Issuing Challan...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Generate Delivery Challan & Gate Pass</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
