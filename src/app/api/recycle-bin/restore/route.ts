import { prisma } from '../../../../lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { type, id } = await req.json();
    let result;
    const data = { isDeleted: false, deletedAt: null, deletedBy: null };
    
    switch (type) {
      // Inventory & Raw Materials
      case 'product': result = await prisma.product.update({ where: { id }, data }); break;
      case 'rawMaterial': result = await prisma.rawMaterial.update({ where: { id }, data }); break;
      
      // Master Data
      case 'category': result = await prisma.category.update({ where: { id }, data }); break;
      case 'subCategory': result = await prisma.subCategory.update({ where: { id }, data }); break;
      case 'materialGroup': result = await prisma.materialGroup.update({ where: { id }, data }); break;
      case 'supplier': result = await prisma.supplier.update({ where: { id }, data }); break;
      case 'warehouse': result = await prisma.warehouse.update({ where: { id }, data }); break;
      
      // Procurement & Logistics
      case 'purchaseOrder': result = await prisma.purchaseOrder.update({ where: { id }, data }); break;
      case 'rfq': result = await prisma.rFQ.update({ where: { id }, data }); break;
      case 'supplierQuotation': result = await prisma.supplierQuotation.update({ where: { id }, data }); break;
      case 'gateEntry': result = await prisma.gateEntry.update({ where: { id }, data }); break;
      case 'reelInward': result = await prisma.reelInward.update({ where: { id }, data }); break;

      // Sales Modules
      case 'customer': result = await prisma.customer.update({ where: { id }, data }); break;
      case 'salesLead': result = await prisma.salesLead.update({ where: { id }, data }); break;
      case 'salesQuotation': result = await prisma.salesQuotation.update({ where: { id }, data }); break;
      case 'salesOrderEntity': result = await prisma.salesOrderEntity.update({ where: { id }, data }); break;
      case 'dispatch': result = await prisma.dispatch.update({ where: { id }, data }); break;

      // User Management
      case 'user': result = await prisma.user.update({ where: { id }, data: { isDeleted: false, deletedAt: null, deletedBy: null } }); break;
      
      default: return NextResponse.json({ success: false, error: `Invalid entity type: ${type}` }, { status: 400 });
    }
        
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error restoring item:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to restore item' }, { status: 500 });
  }
}
