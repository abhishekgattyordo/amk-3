// In-memory persistent store fallback for Sales when PostgreSQL database is unavailable or denied
export interface InMemoryCustomer {
  id: string;
  name: string;
  code: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  status: string;
  salesExecutive?: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date | null;
  _count?: {
    leads: number;
    quotations: number;
    salesOrders: number;
    dispatches: number;
  };
}

export interface InMemorySalesLead {
  id: string;
  leadNumber: string;
  customerId?: string | null;
  customerName: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  productRequirement: string;
  productDescription?: string;
  expectedQuantity: number;
  requiredDeliveryDate?: string;
  specifications?: string;
  sampleRequired?: boolean;
  sampleDetails?: string;
  assignedSalesExecutive?: string;
  leadSource?: string;
  followUpDate?: string;
  costingRequestId?: string;
  customerPoNumber?: string;
  customerPoDate?: string;
  customerPoAttachment?: string;
  status: string;
  remarks?: string;
  attachments?: any;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date | null;
  customer?: any;
  timeline?: any[];
  quotations?: any[];
  salesOrders?: any[];
}

export interface InMemoryQuotation {
  id: string;
  quotationNumber: string;
  leadId?: string | null;
  customerId?: string | null;
  customerName: string;
  productId?: string | null;
  productName: string;
  revision: number;
  quotationDate: string;
  validUntil?: string;
  amount: number;
  salesExecutive?: string;
  status: string;
  costingSummary?: string;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date | null;
  lead?: any;
  customer?: any;
  revisions?: any[];
}

export interface InMemorySalesOrder {
  id: string;
  soNumber: string;
  customerId?: string | null;
  customerName: string;
  customerPoNumber?: string;
  poDate?: string;
  leadId?: string | null;
  quotationId?: string | null;
  productId?: string | null;
  productName: string;
  quantity: number;
  quantityDispatched: number;
  quantityPending: number;
  unitPrice: number;
  totalValue: number;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
  orderDate: string;
  deliveryDate?: string;
  salesExecutive?: string;
  status: string;
  productionStatus: string;
  dispatchStatus: string;
  warehouseId?: string | null;
  shippingAddress?: string;
  billingAddress?: string;
  specialInstructions?: string;
  attachments?: any;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date | null;
  customer?: any;
  product?: any;
  warehouse?: any;
  lead?: any;
  dispatches?: any[];
}

export interface InMemoryDispatch {
  id: string;
  challanNumber: string;
  dispatchDate: string;
  salesOrderId: string;
  soNumber?: string;
  customerId?: string | null;
  customerName?: string;
  vehicleNumber: string;
  transporterName?: string;
  driverName?: string;
  driverPhone?: string;
  lrNumber?: string;
  ewayBillNumber?: string;
  sealNumber?: string;
  totalQuantity: number;
  totalBundles?: number;
  totalWeightKg?: number;
  warehouseId?: string | null;
  status: string;
  gatePassNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date | null;
  items: any[];
  salesOrder?: any;
  customer?: any;
  warehouse?: any;
}

// Global Store State
class SalesInMemoryStore {
  customers: InMemoryCustomer[] = [
    {
      id: 'cust-1',
      name: 'Nestlé India Ltd',
      code: 'CUST-0001',
      contactPerson: 'Mr. Rajesh Pillai',
      phone: '+91 98201 44556',
      email: 'r.pillai@nestle.in',
      address: 'Plot 100, Industrial Area, Sector 5, Haridwar, Uttarakhand - 249403',
      status: 'Active',
      salesExecutive: 'Rajesh Sharma',
      createdAt: new Date('2026-01-10T10:00:00Z'),
      updatedAt: new Date('2026-01-10T10:00:00Z'),
      isDeleted: false,
      _count: { leads: 1, quotations: 1, salesOrders: 1, dispatches: 1 },
    },
    {
      id: 'cust-2',
      name: 'Britannia Industries Ltd',
      code: 'CUST-0002',
      contactPerson: 'Ms. Priya Sharma',
      phone: '+91 98450 11223',
      email: 'priya.s@britannia.co.in',
      address: '5/1A Hungerford Street, Kolkata, West Bengal - 700017',
      status: 'Active',
      salesExecutive: 'Amit Patel',
      createdAt: new Date('2026-01-15T11:00:00Z'),
      updatedAt: new Date('2026-01-15T11:00:00Z'),
      isDeleted: false,
      _count: { leads: 1, quotations: 1, salesOrders: 1, dispatches: 0 },
    },
    {
      id: 'cust-3',
      name: 'ITC Limited (Foods Division)',
      code: 'CUST-0003',
      contactPerson: 'Mr. Arvind Rao',
      phone: '+91 97110 99887',
      email: 'arvind.rao@itc.in',
      address: 'Virginia House, 37 J.L. Nehru Road, Kolkata - 700071',
      status: 'Active',
      salesExecutive: 'Rajesh Sharma',
      createdAt: new Date('2026-01-20T09:30:00Z'),
      updatedAt: new Date('2026-01-20T09:30:00Z'),
      isDeleted: false,
      _count: { leads: 1, quotations: 1, salesOrders: 1, dispatches: 1 },
    },
    {
      id: 'cust-4',
      name: 'Hindustan Unilever Ltd',
      code: 'CUST-0004',
      contactPerson: 'Mr. Suresh Nair',
      phone: '+91 98300 55441',
      email: 'suresh.nair@hul.com',
      address: 'Unilever House, B.D. Sawant Marg, Chakala, Andheri East, Mumbai - 400099',
      status: 'Active',
      salesExecutive: 'Sunita Menon',
      createdAt: new Date('2026-02-01T14:00:00Z'),
      updatedAt: new Date('2026-02-01T14:00:00Z'),
      isDeleted: false,
      _count: { leads: 1, quotations: 0, salesOrders: 0, dispatches: 0 },
    },
    {
      id: 'cust-5',
      name: 'Tata Consumer Products',
      code: 'CUST-0005',
      contactPerson: 'Mr. Vikram Deshmukh',
      phone: '+91 98220 33221',
      email: 'vikram.d@tataconsumer.com',
      address: 'Kirloskar Business Park, Block C, 3rd Floor, Hebbal, Bengaluru - 560024',
      status: 'Active',
      salesExecutive: 'Rajesh Sharma',
      createdAt: new Date('2026-02-10T12:00:00Z'),
      updatedAt: new Date('2026-02-10T12:00:00Z'),
      isDeleted: false,
      _count: { leads: 1, quotations: 1, salesOrders: 0, dispatches: 0 },
    },
  ];

  leads: InMemorySalesLead[] = [
    {
      id: 'lead-1',
      leadNumber: 'LEAD-0001',
      customerId: 'cust-1',
      customerName: 'Nestlé India Ltd',
      contactPerson: 'Mr. Rajesh Pillai',
      phone: '+91 98201 44556',
      email: 'r.pillai@nestle.in',
      productRequirement: '5-Ply Master Shipper Carton (350x250x200mm)',
      productDescription: 'High strength universal outer carton for Maggi noodles packets',
      expectedQuantity: 25000,
      requiredDeliveryDate: '2026-09-15',
      specifications: '{"ply":"5-Ply","burstingStrength":"14 kg/cm2","topPaperGSM":"180 GSM Kraft","flutingGSM":"140 GSM Fluting","dimension":"350x250x200 mm"}',
      sampleRequired: true,
      sampleDetails: '3 unprinted die-cut samples submitted for drop test',
      assignedSalesExecutive: 'Rajesh Sharma',
      leadSource: 'Direct Inquiry',
      followUpDate: '2026-09-05',
      status: 'Won',
      remarks: 'Client approved sample and confirmed pricing.',
      createdAt: new Date('2026-02-05T09:00:00Z'),
      updatedAt: new Date('2026-02-12T15:00:00Z'),
      isDeleted: false,
      timeline: [
        { id: 'tl-1', action: 'Lead Created', user: 'Rajesh Sharma', remarks: 'Inquiry registered for Nestlé', timestamp: new Date('2026-02-05T09:00:00Z') },
        { id: 'tl-2', action: 'Sample Approved', user: 'Quality Lab', remarks: 'Drop test passed 1.2m', timestamp: new Date('2026-02-08T11:00:00Z') },
        { id: 'tl-3', action: 'Quotation Accepted', user: 'Rajesh Sharma', remarks: 'Accepted at ₹18.00/unit', timestamp: new Date('2026-02-12T15:00:00Z') },
      ],
    },
    {
      id: 'lead-2',
      leadNumber: 'LEAD-0002',
      customerId: 'cust-2',
      customerName: 'Britannia Industries Ltd',
      contactPerson: 'Ms. Priya Sharma',
      phone: '+91 98450 11223',
      email: 'priya.s@britannia.co.in',
      productRequirement: '3-Ply High-GSM Biscuit Cartons (280x200x150mm)',
      productDescription: 'Gloss laminated outer shipper for Good Day biscuit packets',
      expectedQuantity: 50000,
      requiredDeliveryDate: '2026-09-20',
      specifications: '{"ply":"3-Ply","burstingStrength":"10 kg/cm2","topPaperGSM":"230 GSM Duplex","flutingGSM":"120 GSM Fluting","dimension":"280x200x150 mm"}',
      sampleRequired: false,
      assignedSalesExecutive: 'Amit Patel',
      leadSource: 'Key Account RFP',
      followUpDate: '2026-09-02',
      status: 'Costing',
      remarks: 'Costing team calculating paper grammage and ink coverage.',
      createdAt: new Date('2026-02-10T11:30:00Z'),
      updatedAt: new Date('2026-02-15T14:00:00Z'),
      isDeleted: false,
      timeline: [
        { id: 'tl-4', action: 'Lead Created', user: 'Amit Patel', remarks: 'RFP inquiry logged', timestamp: new Date('2026-02-10T11:30:00Z') },
        { id: 'tl-5', action: 'Sent to Costing Department', user: 'Amit Patel', remarks: 'Costing requested for 50k batch', timestamp: new Date('2026-02-15T14:00:00Z') },
      ],
    },
    {
      id: 'lead-3',
      leadNumber: 'LEAD-0003',
      customerId: 'cust-3',
      customerName: 'ITC Limited (Foods Division)',
      contactPerson: 'Mr. Arvind Rao',
      phone: '+91 97110 99887',
      email: 'arvind.rao@itc.in',
      productRequirement: '5-Ply Heavy Duty Export Carton (450x320x300mm)',
      productDescription: 'Export grade corrugated master shipper with moisture barrier coating',
      expectedQuantity: 15000,
      requiredDeliveryDate: '2026-09-10',
      specifications: '{"ply":"5-Ply","burstingStrength":"16 kg/cm2","topPaperGSM":"250 GSM Virgin Kraft","flutingGSM":"150 GSM Heavy Fluting","dimension":"450x320x300 mm"}',
      sampleRequired: true,
      sampleDetails: 'Export sample sent via courier for humidity testing',
      assignedSalesExecutive: 'Rajesh Sharma',
      leadSource: 'Direct Inquiry',
      followUpDate: '2026-09-01',
      status: 'Quotation Sent',
      remarks: 'Quotation sent; awaiting procurement committee approval.',
      createdAt: new Date('2026-02-12T16:00:00Z'),
      updatedAt: new Date('2026-02-18T10:00:00Z'),
      isDeleted: false,
      timeline: [
        { id: 'tl-6', action: 'Lead Created', user: 'Rajesh Sharma', remarks: 'Export inquiry registered', timestamp: new Date('2026-02-12T16:00:00Z') },
        { id: 'tl-7', action: 'Quotation Sent (QUO-0003)', user: 'Rajesh Sharma', remarks: 'Submitted quote ₹25.33/unit', timestamp: new Date('2026-02-18T10:00:00Z') },
      ],
    },
    {
      id: 'lead-4',
      leadNumber: 'LEAD-0004',
      customerId: 'cust-5',
      customerName: 'Tata Consumer Products',
      contactPerson: 'Mr. Vikram Deshmukh',
      phone: '+91 98220 33221',
      email: 'vikram.d@tataconsumer.com',
      productRequirement: 'Universal Tea Packet Shipper (400x300x250mm)',
      productDescription: 'Regular slotted carton with 2-color flexo printing',
      expectedQuantity: 10000,
      requiredDeliveryDate: '2026-09-25',
      specifications: '{"ply":"3-Ply","burstingStrength":"12 kg/cm2","topPaperGSM":"200 GSM Kraft","dimension":"400x300x250 mm"}',
      sampleRequired: false,
      assignedSalesExecutive: 'Rajesh Sharma',
      leadSource: 'Direct Inquiry',
      status: 'New Inquiry',
      remarks: 'Initial discussion initiated.',
      createdAt: new Date('2026-02-20T10:00:00Z'),
      updatedAt: new Date('2026-02-20T10:00:00Z'),
      isDeleted: false,
      timeline: [
        { id: 'tl-8', action: 'Lead Created', user: 'Rajesh Sharma', remarks: 'New inquiry for Tea Packaging', timestamp: new Date('2026-02-20T10:00:00Z') },
      ],
    },
  ];

  quotations: InMemoryQuotation[] = [
    {
      id: 'quo-1',
      quotationNumber: 'QUO-0001',
      leadId: 'lead-1',
      customerId: 'cust-1',
      customerName: 'Nestlé India Ltd',
      productName: '5-Ply Master Shipper Carton (350x250x200mm)',
      revision: 1,
      quotationDate: '2026-02-09',
      validUntil: '2026-09-30',
      amount: 450000,
      salesExecutive: 'Rajesh Sharma',
      status: 'Approved',
      costingSummary: 'Paper & Fluting: ₹12.50 | Adhesive & Stitching: ₹2.10 | Printing: ₹1.40 | Margin: ₹2.00 | Net: ₹18.00/unit x 25,000',
      remarks: 'Standard 30 days payment term upon delivery',
      createdAt: new Date('2026-02-09T10:00:00Z'),
      updatedAt: new Date('2026-02-12T15:00:00Z'),
      isDeleted: false,
      revisions: [
        { id: 'rev-1', revisionNumber: 1, createdDate: '2026-02-09', createdBy: 'Rajesh Sharma', reason: 'Initial Base Quotation', status: 'Approved', amount: 450000 },
      ],
    },
    {
      id: 'quo-2',
      quotationNumber: 'QUO-0002',
      leadId: 'lead-2',
      customerId: 'cust-2',
      customerName: 'Britannia Industries Ltd',
      productName: '3-Ply High-GSM Biscuit Cartons (280x200x150mm)',
      revision: 1,
      quotationDate: '2026-02-16',
      validUntil: '2026-09-25',
      amount: 625000,
      salesExecutive: 'Amit Patel',
      status: 'Pending Costing',
      costingSummary: '50,000 units @ ₹12.50/unit inclusive of duplex top sheet and 3-color flexo printing',
      remarks: 'Subject to paper reel market prices',
      createdAt: new Date('2026-02-16T12:00:00Z'),
      updatedAt: new Date('2026-02-16T12:00:00Z'),
      isDeleted: false,
      revisions: [
        { id: 'rev-2', revisionNumber: 1, createdDate: '2026-02-16', createdBy: 'Amit Patel', reason: 'Initial Quote Draft', status: 'Pending Costing', amount: 625000 },
      ],
    },
    {
      id: 'quo-3',
      quotationNumber: 'QUO-0003',
      leadId: 'lead-3',
      customerId: 'cust-3',
      customerName: 'ITC Limited (Foods Division)',
      productName: '5-Ply Heavy Duty Export Carton (450x320x300mm)',
      revision: 2,
      quotationDate: '2026-02-18',
      validUntil: '2026-09-20',
      amount: 380000,
      salesExecutive: 'Rajesh Sharma',
      status: 'Sent to Customer',
      costingSummary: '15,000 export units @ ₹25.33/unit with moisture barrier coating',
      remarks: 'Special batch pricing with waterproof outer lacquer',
      createdAt: new Date('2026-02-18T10:00:00Z'),
      updatedAt: new Date('2026-02-19T11:00:00Z'),
      isDeleted: false,
      revisions: [
        { id: 'rev-3a', revisionNumber: 1, createdDate: '2026-02-17', createdBy: 'Rajesh Sharma', reason: 'Initial Base Proposal', status: 'Revised', amount: 410000 },
        { id: 'rev-3b', revisionNumber: 2, createdDate: '2026-02-18', createdBy: 'Rajesh Sharma', reason: 'Volume discount 7%', status: 'Sent to Customer', amount: 380000 },
      ],
    },
  ];

  salesOrders: InMemorySalesOrder[] = [
    {
      id: 'so-1',
      soNumber: 'SO-0001',
      customerId: 'cust-1',
      customerName: 'Nestlé India Ltd',
      customerPoNumber: 'PO-NST-2026-889',
      poDate: '2026-02-12',
      leadId: 'lead-1',
      quotationId: 'quo-1',
      productName: '5-Ply Master Shipper Carton (350x250x200mm)',
      quantity: 25000,
      quantityDispatched: 10000,
      quantityPending: 15000,
      unitPrice: 18.0,
      totalValue: 450000,
      taxRate: 18,
      taxAmount: 81000,
      grandTotal: 531000,
      orderDate: '2026-02-13',
      deliveryDate: '2026-09-15',
      salesExecutive: 'Rajesh Sharma',
      status: 'In Production',
      productionStatus: 'Corrugation Complete',
      dispatchStatus: 'Partially Dispatched',
      shippingAddress: 'Plot 100, Industrial Area, Sector 5, Haridwar, Uttarakhand - 249403',
      billingAddress: 'Nestlé House, Jacaranda Marg, M Block, DLF City Phase II, Gurugram, Haryana - 122002',
      specialInstructions: 'Bundle size: 25 cartons per bundle strapped with PP band',
      createdAt: new Date('2026-02-13T10:00:00Z'),
      updatedAt: new Date('2026-02-25T14:00:00Z'),
      isDeleted: false,
    },
    {
      id: 'so-2',
      soNumber: 'SO-0002',
      customerId: 'cust-2',
      customerName: 'Britannia Industries Ltd',
      customerPoNumber: 'PO-BRT-90021',
      poDate: '2026-02-18',
      leadId: 'lead-2',
      quotationId: 'quo-2',
      productName: '3-Ply High-GSM Biscuit Cartons (280x200x150mm)',
      quantity: 50000,
      quantityDispatched: 0,
      quantityPending: 50000,
      unitPrice: 12.5,
      totalValue: 625000,
      taxRate: 18,
      taxAmount: 112500,
      grandTotal: 737500,
      orderDate: '2026-02-19',
      deliveryDate: '2026-09-20',
      salesExecutive: 'Amit Patel',
      status: 'Confirmed',
      productionStatus: 'Planning',
      dispatchStatus: 'Pending',
      shippingAddress: '5/1A Hungerford Street, Kolkata, West Bengal - 700017',
      billingAddress: '5/1A Hungerford Street, Kolkata, West Bengal - 700017',
      createdAt: new Date('2026-02-19T11:00:00Z'),
      updatedAt: new Date('2026-02-19T11:00:00Z'),
      isDeleted: false,
    },
    {
      id: 'so-3',
      soNumber: 'SO-0003',
      customerId: 'cust-3',
      customerName: 'ITC Limited (Foods Division)',
      customerPoNumber: 'PO-ITC-EXP-441',
      poDate: '2026-02-20',
      leadId: 'lead-3',
      quotationId: 'quo-3',
      productName: '5-Ply Heavy Duty Export Carton (450x320x300mm)',
      quantity: 15000,
      quantityDispatched: 15000,
      quantityPending: 0,
      unitPrice: 25.33,
      totalValue: 380000,
      taxRate: 18,
      taxAmount: 68400,
      grandTotal: 448400,
      orderDate: '2026-02-21',
      deliveryDate: '2026-09-10',
      salesExecutive: 'Rajesh Sharma',
      status: 'Ready',
      productionStatus: 'Completed',
      dispatchStatus: 'Dispatched',
      shippingAddress: 'Virginia House, 37 J.L. Nehru Road, Kolkata - 700071',
      billingAddress: 'Virginia House, 37 J.L. Nehru Road, Kolkata - 700071',
      createdAt: new Date('2026-02-21T09:00:00Z'),
      updatedAt: new Date('2026-02-28T16:00:00Z'),
      isDeleted: false,
    },
  ];

  dispatches: InMemoryDispatch[] = [
    {
      id: 'dc-1',
      challanNumber: 'DC-0001',
      dispatchDate: '2026-02-25',
      salesOrderId: 'so-1',
      soNumber: 'SO-0001',
      customerId: 'cust-1',
      customerName: 'Nestlé India Ltd',
      vehicleNumber: 'MH-12-RN-8822',
      transporterName: 'VRL Logistics',
      driverName: 'Ramesh Yadav',
      driverPhone: '+91 98900 12345',
      lrNumber: 'VRL-PUN-99882',
      ewayBillNumber: '241100982341',
      sealNumber: 'SEAL-9081',
      totalQuantity: 10000,
      totalBundles: 400,
      totalWeightKg: 4500,
      status: 'Dispatched',
      gatePassNumber: 'GP-2026-081',
      notes: 'First partial batch delivery of 10,000 units',
      createdAt: new Date('2026-02-25T11:00:00Z'),
      updatedAt: new Date('2026-02-25T11:00:00Z'),
      isDeleted: false,
      items: [
        { id: 'dci-1', productName: '5-Ply Master Shipper Carton (350x250x200mm)', quantity: 10000, bundleCount: 400, weightKg: 4500 },
      ],
    },
    {
      id: 'dc-2',
      challanNumber: 'DC-0002',
      dispatchDate: '2026-02-28',
      salesOrderId: 'so-3',
      soNumber: 'SO-0003',
      customerId: 'cust-3',
      customerName: 'ITC Limited (Foods Division)',
      vehicleNumber: 'KA-01-AK-4455',
      transporterName: 'Safexpress',
      driverName: 'Manjit Singh',
      driverPhone: '+91 97700 66554',
      lrNumber: 'SFX-KOL-33219',
      ewayBillNumber: '241100994412',
      sealNumber: 'SEAL-9112',
      totalQuantity: 15000,
      totalBundles: 600,
      totalWeightKg: 8200,
      status: 'Delivered',
      gatePassNumber: 'GP-2026-089',
      notes: 'Full order delivered to ITC warehouse',
      createdAt: new Date('2026-02-28T14:00:00Z'),
      updatedAt: new Date('2026-02-28T14:00:00Z'),
      isDeleted: false,
      items: [
        { id: 'dci-2', productName: '5-Ply Heavy Duty Export Carton (450x320x300mm)', quantity: 15000, bundleCount: 600, weightKg: 8200 },
      ],
    },
  ];
}

export const salesStore = new SalesInMemoryStore();
