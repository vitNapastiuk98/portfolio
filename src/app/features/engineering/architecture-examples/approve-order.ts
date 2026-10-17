export interface Order {
  readonly id: string;
  readonly revision: number;
  readonly status: 'draft' | 'approved';
  readonly totalMinor: number;
}

export interface ApprovalCommand {
  readonly orderId: string;
  readonly expectedRevision: number;
  readonly idempotencyKey: string;
}

export interface ApprovalPort {
  approve(command: ApprovalCommand): Promise<Order>;
}

export function approvalCommand(
  order: Order,
  canApprove: boolean,
  idempotencyKey: string,
): ApprovalCommand {
  if (!canApprove) throw new Error('Approval permission is required.');
  if (
    !order.id.trim() ||
    !Number.isSafeInteger(order.revision) ||
    order.revision < 0 ||
    order.revision === Number.MAX_SAFE_INTEGER
  ) {
    throw new Error('A valid order identity and revision are required.');
  }
  if (!Number.isSafeInteger(order.totalMinor) || order.totalMinor < 0) {
    throw new Error('Total must be non-negative integer minor units.');
  }
  if (order.status !== 'draft') throw new Error('Only a draft can be approved.');
  if (!idempotencyKey.trim()) throw new Error('A stable operation identity is required.');
  return { orderId: order.id, expectedRevision: order.revision, idempotencyKey };
}

export async function approveOrder(
  order: Order,
  canApprove: boolean,
  idempotencyKey: string,
  port: ApprovalPort,
): Promise<Order> {
  const command = approvalCommand(order, canApprove, idempotencyKey);
  const approved = await port.approve(command);
  if (
    approved.id !== order.id ||
    approved.status !== 'approved' ||
    approved.revision !== order.revision + 1 ||
    approved.totalMinor !== order.totalMinor
  ) {
    throw new Error('The approval response does not match the expected transition.');
  }
  return approved;
}
