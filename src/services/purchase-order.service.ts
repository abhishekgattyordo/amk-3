import { prisma } from '../lib/prisma';
import { generateNextCode } from '../utils/code-generator';

export class PurchaseOrderService {
  static async getAll(query?: { supplierId?: string; status?: string; search?: string; page?: number; limit?: number }) {
    const page = query?.page || 1;
    const limit = query?.limit || 100;
    const skip = (page - 1) * limit;

    const where: any = { isDeleted: false, deletedAt: null };
    if (query?.supplierId) where.supplierId = query.supplierId;
    if (query?.status) where.status = query.status;
    if (query?.search) {
      where.OR = [
        { poNumber: { contains: query.search, mode: 'insensitive' } },
        { rfqNumber: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [pos, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        include: { supplier: true, items: true, gateEntries: true, reelInwards: true, attachments: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.purchaseOrder.count({ where }),
    ]);

    return { pos, total, page, limit };
  }

  static async getById(id: string) {
    return prisma.purchaseOrder.findUnique({
      where: { id },
      include: { supplier: true, items: true, gateEntries: true, reelInwards: true, attachments: true },
    });
  }

  static async getAttachments(purchaseOrderId: string) {
    return prisma.purchaseOrderAttachment.findMany({
      where: { purchaseOrderId },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async addAttachment(purchaseOrderId: string, data: { fileName: string; fileType: string; fileSize: number; fileData: string; uploadedBy?: string }) {
    return prisma.$transaction(async (tx) => {
      const attachment = await tx.purchaseOrderAttachment.create({
        data: {
          purchaseOrderId,
          fileName: data.fileName,
          fileType: data.fileType,
          fileSize: data.fileSize,
          fileData: data.fileData,
          uploadedBy: data.uploadedBy || 'Administrator'
        }
      });

      await tx.auditLog.create({
        data: {
          action: 'PURCHASE_ORDER_DOCUMENT_UPLOADED',
          module: 'Procurement',
          entity: 'PurchaseOrder',
          entityId: purchaseOrderId,
          details: `Uploaded document ${data.fileName} to Purchase Order`,
        }
      });

      return attachment;
    });
  }

  static async deleteAttachment(attachmentId: string) {
    return prisma.purchaseOrderAttachment.delete({
      where: { id: attachmentId }
    });
  }

  static async create(data: any) {
    const { items, ...poData } = data;

    return prisma.$transaction(async (tx) => {
      const poNumber = await generateNextCode('purchaseOrder', 'PO-', 'poNumber', 4, tx);

      const po = await tx.purchaseOrder.create({
        data: {
          ...poData,
          poNumber,
          items: items?.length ? { create: items } : undefined,
        },
        include: { supplier: true, items: true },
      });

      await tx.auditLog.create({
        data: {
          action: 'PURCHASE_ORDER_CREATED',
          module: 'Procurement',
          entity: 'PurchaseOrder',
          entityId: po.id,
          details: `Created Purchase Order ${po.poNumber}`,
        },
      });

      return po;
    });
  }

  static async update(id: string, data: any) {
    const { items, ...poData } = data;

    return prisma.$transaction(async (tx) => {
      if (items) {
        await tx.purchaseOrderItem.deleteMany({ where: { poId: id } });
      }

      const updated = await tx.purchaseOrder.update({
        where: { id },
        data: {
          ...poData,
          items: items?.length ? { create: items } : undefined,
        },
        include: { supplier: true, items: true },
      });

      return updated;
    });
  }

  static async delete(id: string, userId?: string, userName?: string) {
    return prisma.purchaseOrder.update({ 
      where: { id }, 
      data: { isDeleted: true, deletedAt: new Date(), deletedBy: userName || 'Administrator' } 
    });
  }
}
