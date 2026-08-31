import { prisma } from '../../../lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [
      products,
      rawMaterials,
      categories,
      subCategories,
      materialGroups,
      suppliers,
      warehouses,
      purchaseOrders,
      rfqs,
      supplierQuotations,
      gateEntries,
      reelInwards,
      customers,
      salesLeads,
      salesQuotations,
      salesOrders,
      dispatches,
      users,
    ] = await Promise.all([
      prisma.product.findMany({ where: { isDeleted: true } }).catch(() => []),
      prisma.rawMaterial.findMany({ where: { isDeleted: true } }).catch(() => []),
      prisma.category.findMany({ where: { isDeleted: true } }).catch(() => []),
      prisma.subCategory.findMany({ where: { isDeleted: true } }).catch(() => []),
      prisma.materialGroup.findMany({ where: { isDeleted: true } }).catch(() => []),
      prisma.supplier.findMany({ where: { isDeleted: true } }).catch(() => []),
      prisma.warehouse.findMany({ where: { isDeleted: true } }).catch(() => []),
      prisma.purchaseOrder.findMany({ where: { isDeleted: true } }).catch(() => []),
      prisma.rFQ.findMany({ where: { isDeleted: true } }).catch(() => []),
      prisma.supplierQuotation.findMany({ where: { isDeleted: true } }).catch(() => []),
      prisma.gateEntry.findMany({ where: { isDeleted: true } }).catch(() => []),
      prisma.reelInward.findMany({ where: { isDeleted: true } }).catch(() => []),
      prisma.customer.findMany({ where: { isDeleted: true } }).catch(() => []),
      prisma.salesLead.findMany({ where: { isDeleted: true } }).catch(() => []),
      prisma.salesQuotation.findMany({ where: { isDeleted: true } }).catch(() => []),
      prisma.salesOrderEntity.findMany({ where: { isDeleted: true } }).catch(() => []),
      prisma.dispatch.findMany({ where: { isDeleted: true } }).catch(() => []),
      prisma.user.findMany({ 
        where: { 
          OR: [
            { isDeleted: true },
            { deletedAt: { not: null } }
          ] 
        } 
      }).catch(() => []),
    ]);

    const formatItems = (items: any[], module: string, page: string, nameField: string | ((item: any) => string), type: string) => 
      (items || []).map(item => ({
        id: item.id,
        type,
        module,
        page,
        recordName: typeof nameField === 'function' ? nameField(item) : (item[nameField] || `${type} #${item.id}`),
        deletedBy: item.deletedBy || 'Administrator',
        deletedAt: item.deletedAt || item.updatedAt || new Date().toISOString(),
      }));

    const allDeletedItems = [
      // Inventory & Raw Materials
      ...formatItems(products, 'Inventory', 'Finished Products List', (p) => p.code ? `${p.code} - ${p.name}` : p.name, 'product'),
      ...formatItems(rawMaterials, 'Raw Materials', 'Raw Materials List', (r) => r.code ? `${r.code} - ${r.name}` : r.name, 'rawMaterial'),
      
      // Master Data
      ...formatItems(categories, 'Master Data', 'Categories', 'name', 'category'),
      ...formatItems(subCategories, 'Master Data', 'Subcategories', 'name', 'subCategory'),
      ...formatItems(materialGroups, 'Master Data', 'Material Groups', 'name', 'materialGroup'),
      ...formatItems(suppliers, 'Master Data', 'Suppliers', (s) => s.millName ? `${s.supplierName} (${s.millName})` : s.supplierName, 'supplier'),
      ...formatItems(warehouses, 'Master Data', 'Warehouses', 'name', 'warehouse'),
      
      // Procurement & Logistics
      ...formatItems(purchaseOrders, 'Procurement', 'Purchase Order List', 'poNumber', 'purchaseOrder'),
      ...formatItems(rfqs, 'Procurement', 'RFQ List', 'rfqNumber', 'rfq'),
      ...formatItems(supplierQuotations, 'Procurement', 'Quotations List', 'quoteNumber', 'supplierQuotation'),
      ...formatItems(gateEntries, 'Procurement', 'Gate Entry', (g) => g.vehicleNumber ? `${g.entryNumber || g.gateEntryNumber} (${g.vehicleNumber})` : (g.entryNumber || g.gateEntryNumber), 'gateEntry'),
      ...formatItems(reelInwards, 'Procurement', 'Reel Inward', (r) => r.reelNumber ? `${r.inwardNumber || 'Inward'} - Reel: ${r.reelNumber}` : (r.inwardNumber || 'Reel Inward'), 'reelInward'),

      // Sales Module
      ...formatItems(customers, 'Sales', 'Customer Directory', (c) => c.code ? `${c.code} - ${c.name}` : c.name, 'customer'),
      ...formatItems(salesLeads, 'Sales', 'Sales Leads & Enquiries', (l) => l.customerName ? `${l.leadNumber} - ${l.customerName}` : l.leadNumber, 'salesLead'),
      ...formatItems(salesQuotations, 'Sales', 'Sales Quotations', (q) => q.customerName ? `${q.quotationNumber} - ${q.customerName}` : q.quotationNumber, 'salesQuotation'),
      ...formatItems(salesOrders, 'Sales', 'Sales Orders', (so) => so.customerName ? `${so.soNumber} - ${so.customerName}` : so.soNumber, 'salesOrderEntity'),
      ...formatItems(dispatches, 'Sales', 'Delivery Challans & Dispatch', (d) => d.customerName ? `${d.challanNumber} - ${d.customerName}` : d.challanNumber, 'dispatch'),

      // User Management
      ...formatItems(users, 'User Management', 'Users Directory', (u) => u.department ? `${u.name} (${u.email}) - ${u.department}` : `${u.name} (${u.email})`, 'user'),
    ].sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());

    return NextResponse.json({
      success: true,
      data: allDeletedItems
    });
  } catch (error: any) {
    console.error('Error fetching recycle bin:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch recycle bin' }, { status: 500 });
  }
}
