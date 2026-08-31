import { NextRequest } from 'next/server';
import { SalesService } from '../../../../../services/sales.service';
import { successResponse, errorResponse } from '../../../../../utils/api';
import { getAuthorizedUser, hasApiPermission } from '../../../../../middleware/auth.middleware';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthorizedUser(req);
    if (!hasApiPermission(user, 'sales:view')) {
      return errorResponse('Forbidden: Insufficient Permissions', 403);
    }

    const orders = await SalesService.getOrdersPendingDispatch();
    return successResponse(orders);
  } catch (err: any) {
    return errorResponse(err, 400);
  }
}
