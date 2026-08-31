export type UserRole = 'Administrator' | 'Inventory Manager' | 'Purchase Manager' | 'Production Manager' | 'Sales Manager' | 'Accountant' | 'Warehouse Manager' | 'Viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department: string;
  permissions?: string[];
}

export type ModuleType = 'dashboard' | 'inventory_raw' | 'inventory_products' | 'inventory_categories' | 'inventory_suppliers' | 'inventory_warehouses' | 'inventory_transactions' | 'inventory_stock' | 'procurement' | 'procurement_dashboard' | 'procurement_rfq' | 'procurement_quotes' | 'procurement_po' | 'procurement_inward' | 'procurement_gate_entry' | 'procurement_reel_inward' | 'procurement_qc' | 'production' | 'sales' | 'sales_dashboard' | 'sales_leads' | 'sales_quotations' | 'sales_orders' | 'sales_customers' | 'sales_dispatch' | 'accounts' | 'reports' | 'settings' | 'admin_excel' | 'user_management' | 'recycle_bin';

export interface RawMaterial {
  id: string;
  code: string;
  name: string;
  category: string;
  subCategory: string;
  grade: string; // e.g. "BF-18", "Kraft-200"
  gsm: number;
  thickness: number; // in mm or microns
  uom: string; // e.g. "Reams", "Kg", "Rolls", "Sheets"
  hsnCode: string;
  supplierId?: string;
  supplier?: any;
  warehouseId?: string;
  warehouse?: any;
  currentStock: number;
  minStock: number;
  maxStock: number;
  reorderLevel: number;
  purchasePrice: number;
  status: 'Active' | 'Inactive' | 'Discontinued';
  description: string;
  lastUpdated: string;
  documentsCount: number;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  subCategory: string;
  boxType: 'RSC (Regular Slotted Carton)' | 'HSC' | 'Die-Cut' | 'Partition' | 'Sheet Board' | 'Corrugated Roll';
  dimensions: string; // e.g. "400 x 300 x 250 mm"
  gsm: number;
  unit: string; // "Pcs", "Boxes", "Bundles"
  uom: string;
  hsnCode: string;
  costPrice: number;
  sellingPrice: number;
  warehouse: string;
  availableStock: number;
  status: 'Active' | 'Inactive';
  imageUrl?: string;
  specifications: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  type: 'Raw Material' | 'Finished Product' | 'Material Group';
  code: string;
  parentCategory?: string;
  description: string;
  itemsCount: number;
  status: 'Active' | 'Inactive';
  createdAt?: string;
}

export interface SubcategoryItem {
  id: string;
  code: string;
  name: string;
  parentCategoryId: string;
  description: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface Supplier {
  id: string;
  supplierName: string;
  supplierCode?: string;
  millName: string; // Mandatory mill name
  category: string;
  categories?: CategoryItem[];
  subCategories?: SubcategoryItem[];
  rawMaterials?: any[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  location: string;
  manager: string;
  capacitySqFt: number;
  capacity?: number;
  currentUtilizationPercent: number;
  currentUtilization?: number;
  totalBins: number;
  activeItemsCount: number;
  status: 'Operational' | 'Maintenance' | 'Full';
  stockLevels?: any[];
  createdAt?: string;
  updatedAt?: string;
}

export interface StoredStockItem {
  id?: string;
  itemId?: string;
  itemType: 'RAW_MATERIAL' | 'PRODUCT' | 'Raw Material' | 'Finished Product';
  code: string;
  name: string;
  category?: string;
  quantity: number;
  uom: string;
  updatedAt?: string;
}

export interface StoredReelItem {
  id?: string;
  reelNumber: string;
  material: string;
  weight: number;
  uom: string;
  gsm?: number;
  bf?: number;
  lotNumber?: string;
  qcStatus: string;
  inwardNumber?: string;
  qcNumber?: string;
  date?: string;
}

export interface BinLocationItem {
  id: string;
  code: string;
  name: string;
  warehouseId: string;
  warehouseName?: string;
  warehouseCode?: string;
  type: 'Storage' | 'Loading' | 'Staging' | 'Quality Check';
  status: 'Active' | 'Inactive';
  createdAt: string;
  currentStock?: number;
  storedItemsCount?: number;
  storedReelsCount?: number;
  stockLevels?: any[];
  items?: StoredStockItem[];
  reels?: StoredReelItem[];
}

export type TransactionType = 
  | 'Stock In'
  | 'Stock Out'
  | 'Warehouse Transfer'
  | 'Stock Adjustment'
  | 'Production Issue'
  | 'Sales Return'
  | 'QC Release';

export interface InventoryTransaction {
  id: string;
  transactionNumber: string;
  itemCode: string;
  itemName: string;
  itemType: 'Raw Material' | 'Finished Product';
  warehouse: string;
  quantity: number;
  previousStock: number;
  currentStock: number;
  transactionType: TransactionType;
  user: string;
  date: string;
  time: string;
  reason: string;
  remarks: string;
  referenceNumber?: string;
  referenceType?: string;
  destinationWarehouse?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'alert' | 'warning' | 'info' | 'success' | 'error';
  read: boolean;
  module?: string;
  priority?: 'Info' | 'Warning' | 'Success' | 'Error';
  recipientRole?: string;
  emailSent?: boolean;
  emailRecipient?: string;
  entityId?: string;
  entityType?: string;
}

export interface NotificationSettingRule {
  id: string;
  eventName: string;
  eventKey: 'rfq_created' | 'rfq_sent' | 'quote_received' | 'po_created' | 'po_approved' | 'po_rejected' | 'goods_received' | 'po_completed';
  module: string;
  inAppEnabled: boolean;
  emailEnabled: boolean;
  recipients: string;
  priority: 'Info' | 'Warning' | 'Success' | 'Error';
}

export interface AuditLog {
  id: string;
  action: string;
  module?: string;
  entity: string;
  entityId: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  user?: string;
  userId?: string;
  details?: string;
  timestamp: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  module: string;
  user: string;
  timestamp: string;
  details: string;
}

export interface RFQItem {
  id: string;
  rfqNumber: string;
  rfqDate: string;
  deliveryDate: string;
  department: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Draft' | 'Sent' | 'Submitted' | 'Awarded' | 'Cancelled';
  description: string;
  remarks: string;
  materials: { materialCode: string; name: string; unit: string; quantity: number; expectedPrice?: number; requiredDate: string; description?: string; remarks?: string }[];
  suppliers: { supplierId: string; supplierName: string; contactPerson: string; email: string; phone: string }[];
  sentDate?: string;
  sentTime?: string;
  sentBy?: string;
  sentSuppliersCount?: number;
  deliveryStatus?: 'Delivered' | 'Pending' | 'Opened' | 'Failed';
  responseDeadline?: string;
  createdAt?: string;
}

export interface ProcurementPO {
  id: string;
  poNumber: string;
  rfqNumber?: string;
  supplierId: string;
  supplierName: string;
  date: string;
  deliveryDate: string;
  status: 'Draft' | 'Submitted' | 'Pending Approval' | 'Pending' | 'Approved' | 'Rejected' | 'Sent to Supplier' | 'Confirmed' | 'Partially Received' | 'Completed' | 'Cancelled';
  items: {
    materialCode: string;
    materialName: string;
    quantityOrdered: number;
    quantityReceived: number;
    unitPrice: number;
    total: number;
  }[];
  remarks: string;
}

export interface Customer {
  id: string;
  code?: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  status: 'Active' | 'Inactive';
  salesExecutive?: string;
  leads?: SalesLead[];
  quotations?: SalesQuotation[];
  salesOrders?: SalesOrder[];
  dispatches?: Dispatch[];
  _count?: {
    leads?: number;
    quotations?: number;
    salesOrders?: number;
    dispatches?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface SalesLead {
  id: string;
  leadNumber: string;
  customerId?: string;
  customer?: Customer;
  customerName: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  productRequirement: string;
  productDescription?: string;
  expectedQuantity: number;
  requiredDeliveryDate?: string;
  specifications?: string;
  sampleRequired: boolean;
  sampleDetails?: string;
  assignedSalesExecutive?: string;
  leadSource?: string;
  followUpDate?: string;
  status: 'Lead' | 'Details Taken / Sample Details' | 'Costing' | 'Proposal Sent' | 'Negotiation' | 'Won' | 'Converted' | 'Lost';
  remarks?: string;
  attachments?: string;
  costingRequestId?: string;
  customerPoNumber?: string;
  customerPoDate?: string;
  customerPoAttachment?: string;
  timeline?: {
    id: string;
    leadId: string;
    action: string;
    user?: string;
    remarks?: string;
    timestamp: string;
  }[];
  quotations?: SalesQuotation[];
  salesOrders?: SalesOrder[];
  createdAt?: string;
  updatedAt?: string;
}

export interface QuotationRevision {
  id: string;
  quotationId: string;
  revisionNumber: number;
  createdDate: string;
  createdBy?: string;
  reason?: string;
  status: string;
  amount: number;
  createdAt?: string;
}

export interface SalesQuotation {
  id: string;
  quotationNumber: string;
  leadId?: string;
  lead?: SalesLead;
  customerId?: string;
  customer?: Customer;
  customerName: string;
  productId?: string;
  productName: string;
  revision: number;
  quotationDate: string;
  validUntil: string;
  amount: number;
  salesExecutive?: string;
  status: 'Pending Costing' | 'Pending Approval' | 'Approved' | 'Proposal Sent' | 'Negotiation' | 'Accepted' | 'Rejected' | 'Revised';
  costingSummary?: string;
  remarks?: string;
  revisions?: QuotationRevision[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SalesOrder {
  id: string;
  soNumber: string;
  customerId?: string;
  customer?: Customer;
  customerName: string;
  customerPoNumber?: string;
  poDate?: string;
  leadId?: string;
  lead?: SalesLead;
  quotationId?: string;
  productId?: string;
  product?: Product;
  productName: string;
  quantity: number;
  quantityDispatched: number;
  quantityPending: number;
  unitPrice: number;
  totalValue: number;
  taxRate?: number;
  taxAmount?: number;
  grandTotal?: number;
  orderDate: string;
  deliveryDate: string;
  salesExecutive?: string;
  status: 'Draft' | 'Confirmed' | 'Planning' | 'In Production' | 'Ready' | 'Partially Dispatched' | 'Dispatched' | 'Delivered' | 'Cancelled';
  productionStatus?: 'Pending Planning' | 'Planning' | 'In Production' | 'Produced' | 'QC Passed';
  dispatchStatus?: 'Pending' | 'Ready for Dispatch' | 'Partially Dispatched' | 'Dispatched' | 'Delivered';
  warehouseId?: string;
  warehouse?: Warehouse;
  shippingAddress?: string;
  billingAddress?: string;
  specialInstructions?: string;
  attachments?: string;
  dispatches?: Dispatch[];
  createdAt?: string;
  updatedAt?: string;
}

export interface DispatchItem {
  id: string;
  dispatchId: string;
  productId?: string;
  product?: Product;
  productCode?: string;
  productName: string;
  orderedQuantity: number;
  dispatchedQuantity: number;
  unit: string;
  bundlesCount: number;
  unitsPerBundle: number;
  boxWeightKg?: number;
  totalWeightKg?: number;
  rate: number;
  amount: number;
  remarks?: string;
  createdAt?: string;
}

export interface Dispatch {
  id: string;
  challanNumber: string;
  dispatchDate: string;
  dispatchTime?: string;
  salesOrderId: string;
  salesOrder?: SalesOrder;
  soNumber: string;
  customerId?: string;
  customer?: Customer;
  customerName: string;
  customerPoNumber?: string;
  warehouseId?: string;
  warehouse?: Warehouse;
  warehouseName?: string;
  vehicleNumber: string;
  driverName?: string;
  driverPhone?: string;
  transporterName?: string;
  lrNumber?: string;
  lrDate?: string;
  ewayBillNumber?: string;
  gatePassNumber?: string;
  shippingAddress?: string;
  deliveryTerm?: string;
  paymentTerms?: string;
  status: 'Ready for Dispatch' | 'Loaded' | 'Dispatched' | 'In Transit' | 'Delivered' | 'Cancelled';
  totalQuantity: number;
  totalBundles: number;
  totalWeightKg: number;
  dispatchedBy?: string;
  verifiedBy?: string;
  remarks?: string;
  inventoryUpdated: boolean;
  items: DispatchItem[];
  createdAt?: string;
  updatedAt?: string;
}

