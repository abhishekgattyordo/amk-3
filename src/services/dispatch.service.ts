import { prisma } from '../lib/prisma';
import { generateNextCode, createWithUniqueCode } from '../utils/code-generator';
import { salesStore, InMemoryDispatch } from './sales-store';

async function tryDb<T = any>(dbFn: () => Promise<any>, fallbackFn: () => Promise<any> | any): Promise<any> {
  try {
    return await dbFn();
  } catch (err: any) {
    console.warn('[DispatchService DB Fallback] Prisma operation failed, using resilient fallback store:', err?.message || err);
    return await fallbackFn();
  }
}

async function syncProductStock(tx: any, productId: string) {
  try {
    const stockLevels = await tx.stockLevel.findMany({
      where: { productId },
    });
    const sum = stockLevels.reduce((acc: number, sl: any) => acc + (sl.currentStock || 0), 0);
    await tx.product.update({
      where: { id: productId },
      data: { availableStock: sum },
    });
    return sum;
  } catch {
    return 0;
  }
}

export class DispatchService {
  static async getAll(query?: {
    salesOrderId?: string;
    customerId?: string;
    status?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) {
    const page = query?.page || 1;
    const limit = query?.limit || 100;
    const skip = (page - 1) * limit;

    return tryDb(
      async () => {
        const where: any = { isDeleted: false, deletedAt: null };
        if (query?.salesOrderId) where.salesOrderId = query.salesOrderId;
        if (query?.customerId) where.customerId = query.customerId;
        if (query?.status && query.status !== 'All') where.status = query.status;
        if (query?.dateFrom || query?.dateTo) {
          where.dispatchDate = {};
          if (query.dateFrom) where.dispatchDate.gte = query.dateFrom;
          if (query.dateTo) where.dispatchDate.lte = query.dateTo;
        }
        if (query?.search) {
          where.OR = [
            { challanNumber: { contains: query.search, mode: 'insensitive' } },
            { soNumber: { contains: query.search, mode: 'insensitive' } },
            { customerName: { contains: query.search, mode: 'insensitive' } },
            { vehicleNumber: { contains: query.search, mode: 'insensitive' } },
            { transporterName: { contains: query.search, mode: 'insensitive' } },
            { lrNumber: { contains: query.search, mode: 'insensitive' } },
            { ewayBillNumber: { contains: query.search, mode: 'insensitive' } },
          ];
        }

        const [dispatches, total] = await Promise.all([
          prisma.dispatch.findMany({
            where,
            include: {
              salesOrder: true,
              customer: true,
              warehouse: true,
              items: { include: { product: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
          }),
          prisma.dispatch.count({ where }),
        ]);

        return { dispatches, total, page, limit };
      },
      () => {
        let filtered = salesStore.dispatches.filter(d => !d.isDeleted);
        if (query?.salesOrderId) {
          filtered = filtered.filter(d => d.salesOrderId === query.salesOrderId);
        }
        if (query?.customerId) {
          filtered = filtered.filter(d => d.customerId === query.customerId);
        }
        if (query?.status && query.status !== 'All') {
          filtered = filtered.filter(d => d.status === query.status);
        }
        if (query?.dateFrom) {
          filtered = filtered.filter(d => d.dispatchDate >= query.dateFrom!);
        }
        if (query?.dateTo) {
          filtered = filtered.filter(d => d.dispatchDate <= query.dateTo!);
        }
        if (query?.search) {
          const s = query.search.toLowerCase();
          filtered = filtered.filter(d =>
            d.challanNumber.toLowerCase().includes(s) ||
            (d.soNumber && d.soNumber.toLowerCase().includes(s)) ||
            (d.customerName && d.customerName.toLowerCase().includes(s)) ||
            (d.vehicleNumber && d.vehicleNumber.toLowerCase().includes(s)) ||
            (d.transporterName && d.transporterName.toLowerCase().includes(s)) ||
            (d.lrNumber && d.lrNumber.toLowerCase().includes(s))
          );
        }
        const total = filtered.length;
        const dispatches = filtered.slice(skip, skip + limit).map(d => ({
          ...d,
          salesOrder: salesStore.salesOrders.find(so => so.id === d.salesOrderId),
          customer: salesStore.customers.find(c => c.id === d.customerId || c.name === d.customerName),
        }));
        return { dispatches, total, page, limit };
      }
    );
  }

  static async getById(id: string) {
    return tryDb(
      async () => {
        return prisma.dispatch.findUnique({
          where: { id },
          include: {
            salesOrder: { include: { lead: true, customer: true, product: true } },
            customer: true,
            warehouse: true,
            items: { include: { product: true } },
          },
        });
      },
      () => {
        const d = salesStore.dispatches.find(item => item.id === id && !item.isDeleted);
        if (!d) return null;
        return {
          ...d,
          salesOrder: salesStore.salesOrders.find(so => so.id === d.salesOrderId),
          customer: salesStore.customers.find(c => c.id === d.customerId || c.name === d.customerName),
        };
      }
    );
  }

  static async create(data: any) {
    return tryDb(
      async () => {
        return createWithUniqueCode('dispatch', 'DC-', 'challanNumber', async (challanNumber) => {
          return prisma.$transaction(async (tx) => {
            const order = await tx.salesOrderEntity.findUnique({
              where: { id: data.salesOrderId },
              include: { customer: true, product: true, warehouse: true },
            });
            if (!order) throw new Error('Sales Order not found');

            const items = data.items || [];
            if (!items.length) {
              throw new Error('At least one item is required for dispatch');
            }

            const totalQuantity = items.reduce((acc: number, item: any) => acc + (Number(item.dispatchedQuantity) || 0), 0);
            const totalBundles = items.reduce((acc: number, item: any) => acc + (Number(item.bundlesCount) || 0), 0);
            const totalWeightKg = items.reduce((acc: number, item: any) => acc + (Number(item.totalWeightKg) || 0), 0);

            if (totalQuantity <= 0) {
              throw new Error('Total dispatch quantity must be greater than zero');
            }

            const warehouseId = data.warehouseId || order.warehouseId || null;
            let warehouseName = data.warehouseName;
            if (warehouseId && !warehouseName) {
              const wh = await tx.warehouse.findUnique({ where: { id: warehouseId } });
              if (wh) warehouseName = wh.name;
            }

            const dispatch = await tx.dispatch.create({
              data: {
                challanNumber,
                dispatchDate: data.dispatchDate || new Date().toISOString().split('T')[0],
                dispatchTime: data.dispatchTime || new Date().toLocaleTimeString(),
                salesOrderId: order.id,
                soNumber: order.soNumber,
                customerId: data.customerId || order.customerId,
                customerName: data.customerName || order.customerName,
                customerPoNumber: data.customerPoNumber || order.customerPoNumber,
                warehouseId,
                warehouseName,
                vehicleNumber: data.vehicleNumber,
                driverName: data.driverName,
                driverPhone: data.driverPhone,
                transporterName: data.transporterName,
                lrNumber: data.lrNumber,
                lrDate: data.lrDate,
                ewayBillNumber: data.ewayBillNumber,
                gatePassNumber: data.gatePassNumber || `GP-${challanNumber}`,
                shippingAddress: data.shippingAddress || order.shippingAddress || order.customer?.address,
                deliveryTerm: data.deliveryTerm || 'Ex-Factory',
                paymentTerms: data.paymentTerms,
                status: data.status || 'Dispatched',
                totalQuantity,
                totalBundles,
                totalWeightKg,
                dispatchedBy: data.dispatchedBy || 'Dispatch Supervisor',
                verifiedBy: data.verifiedBy || 'Gate Security',
                remarks: data.remarks,
                inventoryUpdated: data.inventoryUpdated !== false,
                items: {
                  create: items.map((it: any) => ({
                    productId: it.productId || order.productId || null,
                    productCode: it.productCode || null,
                    productName: it.productName || order.productName,
                    orderedQuantity: Number(it.orderedQuantity) || order.quantity,
                    dispatchedQuantity: Number(it.dispatchedQuantity),
                    unit: it.unit || 'Pcs',
                    bundlesCount: Number(it.bundlesCount) || 0,
                    unitsPerBundle: Number(it.unitsPerBundle) || 0,
                    boxWeightKg: Number(it.boxWeightKg) || 0,
                    totalWeightKg: Number(it.totalWeightKg) || 0,
                    rate: Number(it.rate) || order.unitPrice || 0,
                    amount: (Number(it.dispatchedQuantity) * (Number(it.rate) || order.unitPrice || 0)),
                    remarks: it.remarks,
                  })),
                },
              },
              include: { items: true, salesOrder: true, customer: true, warehouse: true },
            });

            const newQuantityDispatched = (order.quantityDispatched || 0) + totalQuantity;
            const newQuantityPending = Math.max(0, order.quantity - newQuantityDispatched);
            const isFullyDispatched = newQuantityPending === 0;

            await tx.salesOrderEntity.update({
              where: { id: order.id },
              data: {
                quantityDispatched: newQuantityDispatched,
                quantityPending: newQuantityPending,
                dispatchStatus: isFullyDispatched ? 'Dispatched' : 'Partially Dispatched',
                status: isFullyDispatched ? 'Dispatched' : 'Partially Dispatched',
              },
            });

            try {
              await tx.auditLog.create({
                data: {
                  action: 'SALES_DISPATCH_CREATED',
                  module: 'Dispatch',
                  entity: 'Dispatch',
                  entityId: dispatch.id,
                  details: `Created Delivery Challan ${challanNumber} for SO ${order.soNumber} (${totalQuantity} units on vehicle ${data.vehicleNumber})`,
                },
              });
            } catch (_) {}

            return dispatch;
          });
        });
      },
      () => {
        const order = salesStore.salesOrders.find(so => so.id === data.salesOrderId);
        const dcNum = salesStore.dispatches.length + 1;
        const challanNumber = `DC-${String(dcNum).padStart(4, '0')}`;
        const items = data.items || [];
        const totalQuantity = items.reduce((acc: number, item: any) => acc + (Number(item.dispatchedQuantity) || 0), 0);
        const totalBundles = items.reduce((acc: number, item: any) => acc + (Number(item.bundlesCount) || 0), 0);
        const totalWeightKg = items.reduce((acc: number, item: any) => acc + (Number(item.totalWeightKg) || 0), 0);

        const newDispatch: InMemoryDispatch = {
          id: `dc-${Date.now()}`,
          challanNumber,
          dispatchDate: data.dispatchDate || new Date().toISOString().split('T')[0],
          salesOrderId: data.salesOrderId,
          soNumber: order?.soNumber || 'SO-0001',
          customerId: data.customerId || order?.customerId,
          customerName: data.customerName || order?.customerName,
          vehicleNumber: data.vehicleNumber,
          transporterName: data.transporterName,
          driverName: data.driverName,
          driverPhone: data.driverPhone,
          lrNumber: data.lrNumber,
          ewayBillNumber: data.ewayBillNumber,
          sealNumber: data.sealNumber,
          totalQuantity,
          totalBundles,
          totalWeightKg,
          warehouseId: data.warehouseId || null,
          status: 'Dispatched',
          gatePassNumber: data.gatePassNumber || `GP-${challanNumber}`,
          notes: data.remarks,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
          items: items.map((it: any) => ({
            id: `dci-${Date.now()}-${Math.random()}`,
            productName: it.productName || order?.productName || 'Corrugated Box',
            quantity: Number(it.dispatchedQuantity),
            bundleCount: Number(it.bundlesCount) || 0,
            weightKg: Number(it.totalWeightKg) || 0,
            rate: Number(it.rate) || 0,
            amount: Number(it.amount) || 0,
          })),
        };
        salesStore.dispatches.unshift(newDispatch);

        if (order) {
          order.quantityDispatched = (order.quantityDispatched || 0) + totalQuantity;
          order.quantityPending = Math.max(0, order.quantity - order.quantityDispatched);
          order.dispatchStatus = order.quantityPending === 0 ? 'Dispatched' : 'Partially Dispatched';
          order.status = order.quantityPending === 0 ? 'Dispatched' : 'Partially Dispatched';
        }

        return newDispatch;
      }
    );
  }

  static async update(id: string, data: any) {
    return tryDb(
      async () => {
        return prisma.$transaction(async (tx) => {
          const dispatch = await tx.dispatch.update({
            where: { id },
            data: {
              vehicleNumber: data.vehicleNumber,
              driverName: data.driverName,
              driverPhone: data.driverPhone,
              transporterName: data.transporterName,
              lrNumber: data.lrNumber,
              lrDate: data.lrDate,
              ewayBillNumber: data.ewayBillNumber,
              gatePassNumber: data.gatePassNumber,
              shippingAddress: data.shippingAddress,
              deliveryTerm: data.deliveryTerm,
              paymentTerms: data.paymentTerms,
              status: data.status,
              dispatchedBy: data.dispatchedBy,
              verifiedBy: data.verifiedBy,
              remarks: data.remarks,
            },
            include: { items: true, salesOrder: true, customer: true, warehouse: true },
          });

          return dispatch;
        });
      },
      () => {
        const d = salesStore.dispatches.find(item => item.id === id);
        if (!d) throw new Error('Dispatch record not found');
        Object.assign(d, data, { updatedAt: new Date() });
        return d;
      }
    );
  }

  static async updateStatus(id: string, data: { status: string; remarks?: string; user?: string }) {
    return tryDb(
      async () => {
        return prisma.$transaction(async (tx) => {
          const dispatch = await tx.dispatch.update({
            where: { id },
            data: {
              status: data.status,
            },
            include: { items: true, salesOrder: true, customer: true, warehouse: true },
          });

          return dispatch;
        });
      },
      () => {
        const d = salesStore.dispatches.find(item => item.id === id);
        if (!d) throw new Error('Dispatch record not found');
        d.status = data.status;
        d.updatedAt = new Date();
        return d;
      }
    );
  }

  static async cancelDispatch(id: string, data?: { reason?: string; user?: string }) {
    return tryDb(
      async () => {
        return prisma.$transaction(async (tx) => {
          const dispatch = await tx.dispatch.findUnique({
            where: { id },
            include: { items: true, salesOrder: true },
          });
          if (!dispatch) throw new Error('Dispatch record not found');
          if (dispatch.status === 'Cancelled') throw new Error('Dispatch is already cancelled');

          const updated = await tx.dispatch.update({
            where: { id },
            data: {
              status: 'Cancelled',
              remarks: data?.reason ? `Cancelled: ${data.reason}` : 'Cancelled by user',
            },
            include: { items: true, salesOrder: true },
          });

          return updated;
        });
      },
      () => {
        const d = salesStore.dispatches.find(item => item.id === id);
        if (!d) throw new Error('Dispatch record not found');
        d.status = 'Cancelled';
        d.updatedAt = new Date();
        return d;
      }
    );
  }

  static async delete(id: string) {
    return tryDb(
      async () => {
        return prisma.dispatch.update({
          where: { id },
          data: { isDeleted: true, deletedAt: new Date() },
        });
      },
      () => {
        const d = salesStore.dispatches.find(item => item.id === id);
        if (!d) throw new Error('Dispatch record not found');
        d.isDeleted = true;
        d.deletedAt = new Date();
        return d;
      }
    );
  }

  static async getPrintData(id: string) {
    const dispatch: any = await this.getById(id);
    if (!dispatch) throw new Error('Dispatch record not found');

    return {
      company: {
        name: 'AMK Corrugation & Packaging Pvt. Ltd.',
        address: 'Plot No. 42-45, Industrial Area Phase II, Packaging Zone',
        city: 'Mumbai, Maharashtra - 400093',
        gstin: '27AABCA1234F1Z5',
        cin: 'U21022MH2018PTC304891',
        phone: '+91 22 2847 9000',
        email: 'dispatch@amkpackaging.com',
        website: 'www.amkpackaging.com',
      },
      challan: {
        challanNumber: dispatch.challanNumber,
        dispatchDate: dispatch.dispatchDate,
        dispatchTime: dispatch.dispatchTime || '10:00 AM',
        gatePassNumber: dispatch.gatePassNumber,
        ewayBillNumber: dispatch.ewayBillNumber,
        lrNumber: dispatch.lrNumber,
        lrDate: dispatch.lrDate,
        status: dispatch.status,
      },
      transport: {
        vehicleNumber: dispatch.vehicleNumber,
        driverName: dispatch.driverName || 'N/A',
        driverPhone: dispatch.driverPhone || 'N/A',
        transporterName: dispatch.transporterName || 'Self / Direct',
        deliveryTerm: dispatch.deliveryTerm || 'Ex-Factory',
      },
      customer: {
        name: dispatch.customerName,
        poNumber: dispatch.customerPoNumber || 'N/A',
        soNumber: dispatch.soNumber,
        shippingAddress: dispatch.shippingAddress || dispatch.customer?.address || 'Same as Billing Address',
        contactPerson: dispatch.customer?.contactPerson,
        phone: dispatch.customer?.phone,
        email: dispatch.customer?.email,
      },
      items: (dispatch.items || []).map((it: any, idx: number) => ({
        srNo: idx + 1,
        productCode: it.productCode || it.product?.code || 'FG-BOX',
        productName: it.productName,
        orderedQty: it.orderedQuantity || it.quantity,
        dispatchedQty: it.dispatchedQuantity || it.quantity,
        unit: it.unit || 'Pcs',
        bundles: it.bundlesCount || it.bundleCount || 0,
        unitsPerBundle: it.unitsPerBundle || 0,
        boxWeightKg: it.boxWeightKg || 0,
        totalWeightKg: it.totalWeightKg || it.weightKg || 0,
        rate: it.rate || 0,
        amount: it.amount || 0,
        remarks: it.remarks || '',
      })),
      summary: {
        totalQuantity: dispatch.totalQuantity,
        totalBundles: dispatch.totalBundles,
        totalWeightKg: dispatch.totalWeightKg,
        totalAmount: (dispatch.items || []).reduce((acc: number, it: any) => acc + (it.amount || 0), 0),
        dispatchedBy: dispatch.dispatchedBy || 'Dispatch Supervisor',
        verifiedBy: dispatch.verifiedBy || 'Gate Security',
        remarks: dispatch.remarks || dispatch.notes,
      },
    };
  }
}
