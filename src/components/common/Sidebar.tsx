import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Boxes, 
  Layers, 
  Truck, 
  Warehouse as WarehouseIcon, 
  ArrowLeftRight, 
  BarChart3, 
  ShoppingCart, 
  TrendingUp, 
  FileSpreadsheet, 
  Settings as SettingsIcon, 
  ChevronDown, 
  ChevronRight, 
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  BoxesIcon,
  FileText,
  ClipboardCheck,
  Award,
  CheckCircle,
  X,
  Users,
  ShoppingBag,
  Building
} from 'lucide-react';
import { ModuleType, User } from '../../types';

// Persistent global variable to survive re-mounts
let globalSidebarScrollTop = 0;

interface SidebarProps {
  activeModule: ModuleType;
  onSelectModule: (module: ModuleType) => void;
  darkMode: boolean;
  currentUser: User | null;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  darkMode,
  currentUser,
  isMobileOpen,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const savedScrollTop = useRef<number>(globalSidebarScrollTop);
  const isNavigatingRef = useRef<boolean>(false);

  // Preserve open/collapsed accordion states across navigation and sessions
  const [inventoryOpen, setInventoryOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('amk_sidebar_inventory_open');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  const [procurementOpen, setProcurementOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('amk_sidebar_procurement_open');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  const [salesOpen, setSalesOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('amk_sidebar_sales_open');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  const toggleInventory = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setInventoryOpen(prev => {
      const next = !prev;
      try {
        localStorage.setItem('amk_sidebar_inventory_open', String(next));
      } catch (_) {}
      return next;
    });
  };

  const toggleProcurement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setProcurementOpen(prev => {
      const next = !prev;
      try {
        localStorage.setItem('amk_sidebar_procurement_open', String(next));
      } catch (_) {}
      return next;
    });
  };

  const toggleSales = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSalesOpen(prev => {
      const next = !prev;
      try {
        localStorage.setItem('amk_sidebar_sales_open', String(next));
      } catch (_) {}
      return next;
    });
  };

  // Restore initial scroll position from memory / sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('amk_sidebar_scroll_pos');
      const targetTop = saved ? parseFloat(saved) : globalSidebarScrollTop;
      if (!isNaN(targetTop) && targetTop > 0) {
        savedScrollTop.current = targetTop;
        globalSidebarScrollTop = targetTop;
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = targetTop;
        }
      }
    } catch (_) {}
  }, []);

  // Whenever activeModule changes or re-renders occur, ensure the sidebar scroll position is strictly maintained
  useLayoutEffect(() => {
    const applyScroll = () => {
      if (scrollContainerRef.current && savedScrollTop.current > 0) {
        scrollContainerRef.current.scrollTop = savedScrollTop.current;
      }
    };

    applyScroll();

    const animId1 = requestAnimationFrame(() => {
      applyScroll();
      const animId2 = requestAnimationFrame(() => {
        applyScroll();
        // Done with navigation transition window
        isNavigatingRef.current = false;
      });
      return () => cancelAnimationFrame(animId2);
    });

    return () => cancelAnimationFrame(animId1);
  }, [activeModule, isCollapsed, inventoryOpen, procurementOpen, salesOpen]);

  // Track scrolling and immediately record position
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const top = e.currentTarget.scrollTop;
    
    // Ignore false reset events during page transitions when navigating
    if (isNavigatingRef.current && top === 0 && savedScrollTop.current > 0) {
      e.currentTarget.scrollTop = savedScrollTop.current;
      return;
    }

    savedScrollTop.current = top;
    globalSidebarScrollTop = top;
    try {
      sessionStorage.setItem('amk_sidebar_scroll_pos', String(top));
    } catch (_) {}
  };

  const handleSelectModule = (module: ModuleType) => {
    isNavigatingRef.current = true;
    if (scrollContainerRef.current) {
      const currentTop = scrollContainerRef.current.scrollTop;
      if (currentTop > 0) {
        savedScrollTop.current = currentTop;
        globalSidebarScrollTop = currentTop;
        try {
          sessionStorage.setItem('amk_sidebar_scroll_pos', String(currentTop));
        } catch (_) {}
      }
    }
    onSelectModule(module);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const isInventorySubActive = [
    'dashboard',
    'inventory_raw', 
    'inventory_products', 
    'inventory_categories', 
    'inventory_suppliers', 
    'inventory_warehouses', 
    'inventory_transactions', 
    'inventory_stock'
  ].includes(activeModule);

  const isProcurementSubActive = [
    'procurement',
    'procurement_dashboard',
    'procurement_rfq',
    'procurement_quotes',
    'procurement_po',
    'procurement_gate_entry',
    'procurement_reel_inward',
    'procurement_inward',
    'procurement_qc'
  ].includes(activeModule);

  const isSalesSubActive = [
    'sales',
    'sales_dashboard',
    'sales_leads',
    'sales_quotations',
    'sales_orders',
    'sales_dispatch',
    'sales_customers'
  ].includes(activeModule);

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 ${isCollapsed ? 'w-20' : 'w-72'} border-r flex flex-col transition-all duration-300 select-none
        lg:sticky lg:top-0 lg:h-screen shrink-0
        ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
        ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}
      `}>
        <div className={`h-16 px-4 flex items-center justify-between border-b ${darkMode ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-slate-50/50'}`}>
          <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-black text-xl shrink-0">
              AM
            </div>
            {!isCollapsed && (
              <div>
                <h1 className={`font-extrabold text-lg tracking-wide flex items-center ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  AMK <span className="text-emerald-500 ml-1">ERP</span>
                </h1>
                <p className={`text-[10px] font-medium tracking-wider uppercase ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Enterprise Manufacturing</p>
              </div>
            )}
          </div>
          {/* Collapse Toggle Button */}
          {!isMobileOpen && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>
          )}
          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className={`p-1.5 rounded-lg lg:hidden transition-colors ${darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
            title="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      {/* Navigation List with Independent Scroll & Preserved Scroll Offset */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overscroll-contain py-6 px-4 space-y-1.5 custom-scrollbar"
      >
        {/* Dynamic Permission Check Utility */}
        {(() => {
          const canView = (permissionName: string) => {
            if (!currentUser) return false;
            if (currentUser.role === 'Administrator') return true;
            const permissions = (currentUser as any).permissions || [];
            return permissions.includes(permissionName);
          };

          const canViewInventorySubmenu = 
            canView('dashboard:view') ||
            canView('inventory_raw:view') ||
            canView('inventory_products:view') ||
            canView('inventory_categories:view') ||
            canView('inventory_suppliers:view') ||
            canView('inventory_warehouses:view') ||
            canView('inventory_transactions:view') ||
            canView('inventory_stock:view');

          const canViewProcurementSubmenu =
            canView('procurement_dashboard:view') ||
            canView('procurement_rfq:view') ||
            canView('procurement_quotes:view') ||
            canView('procurement_po:view') ||
            canView('procurement_inward:view') ||
            canView('procurement_qc:view');

          return (
            <>
              {/* INVENTORY MODULE */}
              {canViewInventorySubmenu && (
                <div>
                  <button
                    type="button"
                    onClick={toggleInventory}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isInventorySubActive
                        ? (darkMode ? 'text-emerald-400 bg-slate-800/80 font-semibold' : 'text-emerald-700 bg-emerald-50/60 font-semibold')
                        : (darkMode ? 'text-slate-300 hover:bg-slate-800/60 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                    }`}
                    title={isCollapsed ? "Inventory Module" : undefined}
                  >
                    <div className="flex items-center space-x-3">
                      <Package className="w-4 h-4 text-emerald-500" />
                      {!isCollapsed && <span>Inventory Module</span>}
                    </div>
                    {!isCollapsed && (inventoryOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />)}
                  </button>

                  {inventoryOpen && (
                    <div className={`pl-4 mt-1 space-y-1 border-l ml-4 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                      {canView('dashboard:view') && (
                        <button
                          type="button"
                          onClick={() => handleSelectModule('dashboard')}
                          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2.5'} px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                            activeModule === 'dashboard'
                              ? (darkMode ? 'bg-emerald-600/20 text-emerald-400 font-semibold border-l-2 border-emerald-500' : 'bg-emerald-50 text-emerald-700 font-semibold border-l-2 border-emerald-600')
                              : (darkMode ? 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                          }`}
                          title={isCollapsed ? "Inventory Dashboard" : undefined}
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-emerald-500" />
                          {!isCollapsed && <span>Inventory Dashboard</span>}
                        </button>
                      )}

                      {canView('inventory_raw:view') && (
                        <button
                          type="button"
                          onClick={() => handleSelectModule('inventory_raw')}
                          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2.5'} px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                            activeModule === 'inventory_raw'
                              ? (darkMode ? 'bg-emerald-600/20 text-emerald-400 font-semibold border-l-2 border-emerald-500' : 'bg-emerald-50 text-emerald-700 font-semibold border-l-2 border-emerald-600')
                              : (darkMode ? 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                          }`}
                          title={isCollapsed ? "Raw Materials Master" : undefined}
                        >
                          <Boxes className="w-3.5 h-3.5 text-emerald-500" />
                          {!isCollapsed && <span>Raw Materials Master</span>}
                        </button>
                      )}

                      {canView('inventory_products:view') && (
                        <button
                          type="button"
                          onClick={() => handleSelectModule('inventory_products')}
                          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2.5'} px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                            activeModule === 'inventory_products'
                              ? (darkMode ? 'bg-emerald-600/20 text-emerald-400 font-semibold border-l-2 border-emerald-500' : 'bg-emerald-50 text-emerald-700 font-semibold border-l-2 border-emerald-600')
                              : (darkMode ? 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                          }`}
                          title={isCollapsed ? "Products (Finished Goods)" : undefined}
                        >
                          <BoxesIcon className="w-3.5 h-3.5 text-teal-500" />
                          {!isCollapsed && <span>Products (Finished Goods)</span>}
                        </button>
                      )}

                      {canView('inventory_categories:view') && (
                        <button
                          type="button"
                          onClick={() => handleSelectModule('inventory_categories')}
                          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2.5'} px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                            activeModule === 'inventory_categories'
                              ? (darkMode ? 'bg-emerald-600/20 text-emerald-400 font-semibold border-l-2 border-emerald-500' : 'bg-emerald-50 text-emerald-700 font-semibold border-l-2 border-emerald-600')
                              : (darkMode ? 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                          }`}
                          title={isCollapsed ? "Categories & Sub-Categories" : undefined}
                        >
                          <Layers className="w-3.5 h-3.5 text-cyan-500" />
                          {!isCollapsed && <span>Categories & Sub-Categories</span>}
                        </button>
                      )}

                      {canView('inventory_suppliers:view') && (
                        <button
                          type="button"
                          onClick={() => handleSelectModule('inventory_suppliers')}
                          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2.5'} px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                            activeModule === 'inventory_suppliers'
                              ? (darkMode ? 'bg-emerald-600/20 text-emerald-400 font-semibold border-l-2 border-emerald-500' : 'bg-emerald-50 text-emerald-700 font-semibold border-l-2 border-emerald-600')
                              : (darkMode ? 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                          }`}
                          title={isCollapsed ? "Suppliers (Mill Directory)" : undefined}
                        >
                          <Truck className="w-3.5 h-3.5 text-amber-500" />
                          {!isCollapsed && <span>Suppliers (Mill Directory)</span>}
                        </button>
                      )}

                      {canView('inventory_warehouses:view') && (
                        <button
                          type="button"
                          onClick={() => handleSelectModule('inventory_warehouses')}
                          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2.5'} px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                            activeModule === 'inventory_warehouses'
                              ? (darkMode ? 'bg-emerald-600/20 text-emerald-400 font-semibold border-l-2 border-emerald-500' : 'bg-emerald-50 text-emerald-700 font-semibold border-l-2 border-emerald-600')
                              : (darkMode ? 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                          }`}
                          title={isCollapsed ? "Warehouses & Bins" : undefined}
                        >
                          <WarehouseIcon className="w-3.5 h-3.5 text-indigo-500" />
                          {!isCollapsed && <span>Warehouses & Bins</span>}
                        </button>
                      )}

                      {canView('inventory_transactions:view') && (
                        <button
                          type="button"
                          onClick={() => handleSelectModule('inventory_transactions')}
                          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2.5'} px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                            activeModule === 'inventory_transactions'
                              ? (darkMode ? 'bg-emerald-600/20 text-emerald-400 font-semibold border-l-2 border-emerald-500' : 'bg-emerald-50 text-emerald-700 font-semibold border-l-2 border-emerald-600')
                              : (darkMode ? 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                          }`}
                          title={isCollapsed ? "Stock Movements" : undefined}
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5 text-blue-500" />
                          {!isCollapsed && <span>Stock Movements</span>}
                        </button>
                      )}

                      {canView('inventory_stock:view') && (
                        <button
                          type="button"
                          onClick={() => handleSelectModule('inventory_stock')}
                          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2.5'} px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                            activeModule === 'inventory_stock'
                              ? (darkMode ? 'bg-emerald-600/20 text-emerald-400 font-semibold border-l-2 border-emerald-500' : 'bg-emerald-50 text-emerald-700 font-semibold border-l-2 border-emerald-600')
                              : (darkMode ? 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                          }`}
                          title={isCollapsed ? "Stock Alerts" : undefined}
                        >
                          <BarChart3 className="w-3.5 h-3.5 text-rose-500" />
                          {!isCollapsed && <span>Stock Alerts</span>}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Other Modules (Structured Navigation) */}
              {(canView('production:view') || canView('sales:view') || canView('accounts:view') || canView('reports:view') || canViewProcurementSubmenu) && (
                <div className="pt-4 pb-2">
                  {!isCollapsed && (
                    <div className="px-3.5 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Enterprise Modules
                    </div>
                  )}
                </div>
              )}

              {/* PROCUREMENT MODULE */}
              {canViewProcurementSubmenu && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={toggleProcurement}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isProcurementSubActive
                        ? (darkMode ? 'text-emerald-400 bg-slate-800/80 font-semibold' : 'text-emerald-700 bg-emerald-50/60 font-semibold')
                        : (darkMode ? 'text-slate-300 hover:bg-slate-800/60 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                    }`}
                    title={isCollapsed ? "Procurement Module" : undefined}
                  >
                    <div className="flex items-center space-x-3">
                      <ShoppingCart className="w-4 h-4 text-amber-500" />
                      {!isCollapsed && <span>Procurement Module</span>}
                    </div>
                    {!isCollapsed && (procurementOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />)}
                  </button>

                  {procurementOpen && (
                    <div className={`pl-4 mt-1 space-y-1 border-l ml-4 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                      {canView('procurement_dashboard:view') && (
                        <button
                          type="button"
                          onClick={() => handleSelectModule('procurement_dashboard')}
                          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2.5'} px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                            activeModule === 'procurement' || activeModule === 'procurement_dashboard'
                              ? (darkMode ? 'bg-emerald-600/20 text-emerald-400 font-semibold border-l-2 border-emerald-500' : 'bg-emerald-50 text-emerald-700 font-semibold border-l-2 border-emerald-600')
                              : (darkMode ? 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                          }`}
                          title={isCollapsed ? "Procurement Dashboard" : undefined}
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-emerald-500" />
                          {!isCollapsed && <span>Procurement Dashboard</span>}
                        </button>
                      )}

                      {canView('procurement_rfq:view') && (
                        <button
                          type="button"
                          onClick={() => handleSelectModule('procurement_rfq')}
                          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2.5'} px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                            activeModule === 'procurement_rfq'
                              ? (darkMode ? 'bg-emerald-600/20 text-emerald-400 font-semibold border-l-2 border-emerald-500' : 'bg-emerald-50 text-emerald-700 font-semibold border-l-2 border-emerald-600')
                              : (darkMode ? 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                          }`}
                          title={isCollapsed ? "Requisitions & RFQs" : undefined}
                        >
                          <FileText className="w-3.5 h-3.5 text-teal-500" />
                          {!isCollapsed && <span>Requisitions & RFQs</span>}
                        </button>
                      )}

                      {canView('procurement_quotes:view') && (
                        <button
                          type="button"
                          onClick={() => handleSelectModule('procurement_quotes')}
                          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2.5'} px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                            activeModule === 'procurement_quotes'
                              ? (darkMode ? 'bg-emerald-600/20 text-emerald-400 font-semibold border-l-2 border-emerald-500' : 'bg-emerald-50 text-emerald-700 font-semibold border-l-2 border-emerald-600')
                              : (darkMode ? 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                          }`}
                          title={isCollapsed ? "Supplier Quotations" : undefined}
                        >
                          <Award className="w-3.5 h-3.5 text-cyan-500" />
                          {!isCollapsed && <span>Supplier Quotations</span>}
                        </button>
                      )}

                      {canView('procurement_po:view') && (
                        <button
                          type="button"
                          onClick={() => handleSelectModule('procurement_po')}
                          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2.5'} px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                            activeModule === 'procurement_po'
                              ? (darkMode ? 'bg-emerald-600/20 text-emerald-400 font-semibold border-l-2 border-emerald-500' : 'bg-emerald-50 text-emerald-700 font-semibold border-l-2 border-emerald-600')
                              : (darkMode ? 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                          }`}
                          title={isCollapsed ? "Purchase Orders (POs)" : undefined}
                        >
                          <ClipboardCheck className="w-3.5 h-3.5 text-amber-500" />
                          {!isCollapsed && <span>Purchase Orders (POs)</span>}
                        </button>
                      )}

                      {canView('procurement_gate_entry:view') && (
                        <button
                          type="button"
                          onClick={() => handleSelectModule('procurement_gate_entry')}
                          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2.5'} px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                            activeModule === 'procurement_gate_entry' || activeModule === 'procurement_inward'
                              ? (darkMode ? 'bg-emerald-600/20 text-emerald-400 font-semibold border-l-2 border-emerald-500' : 'bg-emerald-50 text-emerald-700 font-semibold border-l-2 border-emerald-600')
                              : (darkMode ? 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                          }`}
                          title={isCollapsed ? "Gate Entry" : undefined}
                        >
                          <Truck className="w-3.5 h-3.5 text-indigo-500" />
                          {!isCollapsed && <span>Gate Entry</span>}
                        </button>
                      )}

                      {canView('procurement_reel_inward:view') && (
                        <button
                          type="button"
                          onClick={() => handleSelectModule('procurement_reel_inward')}
                          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2.5'} px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                            activeModule === 'procurement_reel_inward'
                              ? (darkMode ? 'bg-emerald-600/20 text-emerald-400 font-semibold border-l-2 border-emerald-500' : 'bg-emerald-50 text-emerald-700 font-semibold border-l-2 border-emerald-600')
                              : (darkMode ? 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                          }`}
                          title={isCollapsed ? "Reel Inward" : undefined}
                        >
                          <Layers className="w-3.5 h-3.5 text-emerald-500" />
                          {!isCollapsed && <span>Reel Inward</span>}
                        </button>
                      )}

                      {canView('procurement_qc:view') && (
                        <button
                          type="button"
                          onClick={() => handleSelectModule('procurement_qc')}
                          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2.5'} px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                            activeModule === 'procurement_qc'
                              ? (darkMode ? 'bg-emerald-600/20 text-emerald-400 font-semibold border-l-2 border-emerald-500' : 'bg-emerald-50 text-emerald-700 font-semibold border-l-2 border-emerald-600')
                              : (darkMode ? 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                          }`}
                          title={isCollapsed ? "Quality Control (QC)" : undefined}
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-rose-500" />
                          {!isCollapsed && <span>Quality Control (QC)</span>}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* PRODUCTION MODULE */}
              {canView('production:view') && (
                <button
                  type="button"
                  onClick={() => handleSelectModule('production')}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeModule === 'production'
                      ? (darkMode ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-semibold' : 'bg-emerald-50 text-emerald-700 font-semibold border-l-4 border-emerald-600')
                      : (darkMode ? 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                  }`}
                  title={isCollapsed ? "Production & Corrugation" : undefined}
                >
                  <Boxes className="w-4 h-4 text-emerald-500" />
                  {!isCollapsed && <span>Production & Corrugation</span>}
                </button>
              )}

              {/* SALES MODULE */}
              {canView('sales:view') && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={toggleSales}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isSalesSubActive
                        ? (darkMode ? 'text-emerald-400 bg-slate-800/80 font-semibold' : 'text-emerald-700 bg-emerald-50/60 font-semibold')
                        : (darkMode ? 'text-slate-300 hover:bg-slate-800/60 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                    }`}
                    title={isCollapsed ? "Sales & Dispatch" : undefined}
                  >
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      {!isCollapsed && <span>Sales & Dispatch</span>}
                    </div>
                    {!isCollapsed && (salesOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />)}
                  </button>

                  {salesOpen && (
                    <div className={`pl-4 mt-1 space-y-1 border-l ml-4 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                      <button
                        type="button"
                        onClick={() => handleSelectModule('sales_dashboard')}
                        className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2.5'} px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          activeModule === 'sales' || activeModule === 'sales_dashboard'
                            ? (darkMode ? 'bg-emerald-600/20 text-emerald-400 font-semibold border-l-2 border-emerald-500' : 'bg-emerald-50 text-emerald-700 font-semibold border-l-2 border-emerald-600')
                            : (darkMode ? 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                        }`}
                        title={isCollapsed ? "Sales Dashboard" : undefined}
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-emerald-500" />
                        {!isCollapsed && <span>Sales Dashboard</span>}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectModule('sales_leads')}
                        className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2.5'} px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          activeModule === 'sales_leads'
                            ? (darkMode ? 'bg-emerald-600/20 text-emerald-400 font-semibold border-l-2 border-emerald-500' : 'bg-emerald-50 text-emerald-700 font-semibold border-l-2 border-emerald-600')
                            : (darkMode ? 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                        }`}
                        title={isCollapsed ? "Leads & Pipeline" : undefined}
                      >
                        <Users className="w-3.5 h-3.5 text-blue-500" />
                        {!isCollapsed && <span>Leads & Pipeline</span>}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectModule('sales_quotations')}
                        className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2.5'} px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          activeModule === 'sales_quotations'
                            ? (darkMode ? 'bg-emerald-600/20 text-emerald-400 font-semibold border-l-2 border-emerald-500' : 'bg-emerald-50 text-emerald-700 font-semibold border-l-2 border-emerald-600')
                            : (darkMode ? 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                        }`}
                        title={isCollapsed ? "Quotations" : undefined}
                      >
                        <FileText className="w-3.5 h-3.5 text-teal-500" />
                        {!isCollapsed && <span>Quotations</span>}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectModule('sales_orders')}
                        className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2.5'} px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          activeModule === 'sales_orders'
                            ? (darkMode ? 'bg-emerald-600/20 text-emerald-400 font-semibold border-l-2 border-emerald-500' : 'bg-emerald-50 text-emerald-700 font-semibold border-l-2 border-emerald-600')
                            : (darkMode ? 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                        }`}
                        title={isCollapsed ? "Sales Orders" : undefined}
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
                        {!isCollapsed && <span>Sales Orders</span>}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectModule('sales_dispatch')}
                        className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2.5'} px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          activeModule === 'sales_dispatch'
                            ? (darkMode ? 'bg-emerald-600/20 text-emerald-400 font-semibold border-l-2 border-emerald-500' : 'bg-emerald-50 text-emerald-700 font-semibold border-l-2 border-emerald-600')
                            : (darkMode ? 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                        }`}
                        title={isCollapsed ? "Dispatch & Challans" : undefined}
                      >
                        <Truck className="w-3.5 h-3.5 text-emerald-500" />
                        {!isCollapsed && <span>Dispatch & Challans</span>}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectModule('sales_customers')}
                        className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2.5'} px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          activeModule === 'sales_customers'
                            ? (darkMode ? 'bg-emerald-600/20 text-emerald-400 font-semibold border-l-2 border-emerald-500' : 'bg-emerald-50 text-emerald-700 font-semibold border-l-2 border-emerald-600')
                            : (darkMode ? 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                        }`}
                        title={isCollapsed ? "Customer Master" : undefined}
                      >
                        <Building className="w-3.5 h-3.5 text-indigo-500" />
                        {!isCollapsed && <span>Customer Master</span>}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {canView('accounts:view') && (
                <button
                  type="button"
                  onClick={() => handleSelectModule('accounts')}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeModule === 'accounts'
                      ? (darkMode ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-semibold' : 'bg-emerald-50 text-emerald-700 font-semibold border-l-4 border-emerald-600')
                      : (darkMode ? 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                  }`}
                  title={isCollapsed ? "Accounts & Finance" : undefined}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  {!isCollapsed && <span>Accounts & Finance</span>}
                </button>
              )}

              {canView('reports:view') && (
                <button
                  type="button"
                  onClick={() => handleSelectModule('reports')}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeModule === 'reports'
                      ? (darkMode ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-semibold' : 'bg-emerald-50 text-emerald-700 font-semibold border-l-4 border-emerald-600')
                      : (darkMode ? 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                  }`}
                  title={isCollapsed ? "Reports & Analytics" : undefined}
                >
                  <BarChart3 className="w-4 h-4" />
                  {!isCollapsed && <span>Reports & Analytics</span>}
                </button>
              )}

              {canView('settings:view') && (
                <button
                  type="button"
                  onClick={() => handleSelectModule('settings')}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeModule === 'settings'
                      ? (darkMode ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-semibold' : 'bg-emerald-50 text-emerald-700 font-semibold border-l-4 border-emerald-600')
                      : (darkMode ? 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                  }`}
                  title={isCollapsed ? "Settings & Roles" : undefined}
                >
                  <SettingsIcon className="w-4 h-4" />
                  {!isCollapsed && <span>Settings & Roles</span>}
                </button>
              )}

              {(() => {
                const canViewAdminSection = currentUser?.role === 'Administrator' || canView('user_management:view') || canView('recycle_bin:view') || canView('admin_excel:view');
                if (!canViewAdminSection) return null;

                return (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 mt-2">
                    {!isCollapsed && (
                      <div className="px-3.5 pb-1.5 text-[10px] font-bold text-amber-500 uppercase tracking-widest flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        <span>Admin & Governance</span>
                      </div>
                    )}
                    
                    {(currentUser?.role === 'Administrator' || canView('admin_excel:view')) && (
                      <button
                        type="button"
                        onClick={() => handleSelectModule('admin_excel')}
                        className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          activeModule === 'admin_excel'
                            ? (darkMode ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 font-semibold' : 'bg-amber-50 text-amber-700 font-semibold border-l-4 border-amber-500')
                            : (darkMode ? 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                        }`}
                        title={isCollapsed ? "Excel Import / Export" : undefined}
                      >
                        <FileSpreadsheet className="w-4 h-4 text-amber-500" />
                        {!isCollapsed && <span>Excel Import / Export</span>}
                      </button>
                    )}

                    {(currentUser?.role === 'Administrator' || canView('user_management:view')) && (
                      <button
                        type="button"
                        onClick={() => handleSelectModule('user_management')}
                        className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all mt-1.5 ${
                          activeModule === 'user_management'
                            ? (darkMode ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 font-semibold' : 'bg-amber-50 text-amber-700 font-semibold border-l-4 border-amber-500')
                            : (darkMode ? 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                        }`}
                        title={isCollapsed ? "User & Role Management" : undefined}
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-500" />
                        {!isCollapsed && <span>User & Role Management</span>}
                      </button>
                    )}

                    {(currentUser?.role === 'Administrator' || canView('recycle_bin:view')) && (
                      <button
                        type="button"
                        onClick={() => handleSelectModule('recycle_bin')}
                        className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all mt-1.5 ${
                          activeModule === 'recycle_bin'
                            ? (darkMode ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 font-semibold' : 'bg-amber-50 text-amber-700 font-semibold border-l-4 border-amber-500')
                            : (darkMode ? 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                        }`}
                        title={isCollapsed ? "Recycle Bin" : undefined}
                      >
                        <FileText className="w-4 h-4 text-amber-500" />
                        {!isCollapsed && <span>Recycle Bin</span>}
                      </button>
                    )}
                  </div>
                );
              })()}
            </>
          );
        })()}
      </div>

      {/* Footer System Status */}
      <div className={`p-4 border-t ${darkMode ? 'border-slate-800 bg-slate-950/40 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-ping"></span>
            ERP Server Live
          </span>
          <span className="font-mono text-[10px]">v4.8.2</span>
        </div>
      </div>
    </aside>
    </>
  );
};
