import { prisma } from '../../../../lib/prisma';
import { NextResponse } from 'next/server';
import { AuditService } from '../../../../services/audit.service';

export async function DELETE(req: Request) {
  try {
    const { type, id, userId, userName, userRole } = await req.json();

    // Permission check - Allow Administrator or fallback if not specified in internal calls
    if (userRole && userRole !== 'Administrator' && userRole !== 'Super Admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin permission required' }, { status: 403 });
    }

    let result;
    // Perform physical delete
    switch (type) {
      // Inventory & Raw Materials
      case 'product': result = await prisma.product.delete({ where: { id } }); break;
      case 'rawMaterial': result = await prisma.rawMaterial.delete({ where: { id } }); break;
      
      // Master Data
      case 'category': result = await prisma.category.delete({ where: { id } }); break;
      case 'subCategory': result = await prisma.subCategory.delete({ where: { id } }); break;
      case 'materialGroup': result = await prisma.materialGroup.delete({ where: { id } }); break;
      case 'supplier': result = await prisma.supplier.delete({ where: { id } }); break;
      case 'warehouse': result = await prisma.warehouse.delete({ where: { id } }); break;
      case 'binLocation': result = await prisma.binLocation.delete({ where: { id } }); break;
      
      // Procurement & Logistics
      case 'purchaseOrder': result = await prisma.purchaseOrder.delete({ where: { id } }); break;
      case 'rfq': result = await prisma.rFQ.delete({ where: { id } }); break;
      case 'supplierQuotation': result = await prisma.supplierQuotation.delete({ where: { id } }); break;
      case 'gateEntry': result = await prisma.gateEntry.delete({ where: { id } }); break;
      case 'reelInward': result = await prisma.reelInward.delete({ where: { id } }); break;

      // Sales Modules
      case 'customer': result = await prisma.customer.delete({ where: { id } }); break;
      case 'salesLead': result = await prisma.salesLead.delete({ where: { id } }); break;
      case 'salesQuotation': result = await prisma.salesQuotation.delete({ where: { id } }); break;
      case 'salesOrderEntity': result = await prisma.salesOrderEntity.delete({ where: { id } }); break;
      case 'dispatch': result = await prisma.dispatch.delete({ where: { id } }); break;

      // User Management
      case 'user': result = await prisma.user.delete({ where: { id } }); break;
      
      default: return NextResponse.json({ success: false, error: `Invalid entity type: ${type}` }, { status: 400 });
    }

    // Log the permanent deletion
    try {
      await AuditService.logAction(
        'PERMANENT_DELETE',
        type,
        id,
        `Permanently deleted ${type} with ID ${id}`,
        null, // Pass null if userId is not a valid ID
        userName || 'Administrator'
      );
    } catch (_) {
      // Non-blocking audit log
    }
        
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error permanently deleting item:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete item permanently' }, { status: 500 });
  }
}
