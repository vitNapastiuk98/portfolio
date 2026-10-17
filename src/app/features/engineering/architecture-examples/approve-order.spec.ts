import { describe, expect, it, vi } from 'vitest';
import { approvalCommand, approveOrder } from './approve-order';
import type { Order } from './approve-order';

const draft: Order = { id: 'order-42', revision: 7, status: 'draft', totalMinor: 12000 };

describe('order approval boundary', () => {
  it('validates before any side effect and carries revision and stable operation identity', async () => {
    const approve = vi.fn().mockResolvedValue({ ...draft, status: 'approved', revision: 8 });
    await expect(approveOrder(draft, false, 'attempt-1', { approve })).rejects.toThrow(
      'permission',
    );
    expect(approve).not.toHaveBeenCalled();
    const result = await approveOrder(draft, true, 'attempt-1', { approve });
    expect(approve).toHaveBeenCalledWith({
      orderId: draft.id,
      expectedRevision: 7,
      idempotencyKey: 'attempt-1',
    });
    expect(result.status).toBe('approved');
    expect(draft.status).toBe('draft');
  });

  it.each([-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])(
    'rejects an invalid total %s',
    (totalMinor) => {
      expect(() => approvalCommand({ ...draft, totalMinor }, true, 'attempt-1')).toThrow(
        'minor units',
      );
    },
  );

  it('rejects invalid state, identity and revisions without an Angular dependency', () => {
    expect(() => approvalCommand({ ...draft, status: 'approved' }, true, 'attempt-1')).toThrow(
      'draft',
    );
    expect(() => approvalCommand({ ...draft, id: '' }, true, 'attempt-1')).toThrow('identity');
    expect(() =>
      approvalCommand({ ...draft, revision: Number.MAX_SAFE_INTEGER }, true, 'attempt-1'),
    ).toThrow('revision');
    expect(() => approvalCommand({ ...draft, revision: -1 }, true, 'attempt-1')).toThrow(
      'revision',
    );
    expect(() => approvalCommand(draft, true, ' ')).toThrow('operation identity');
  });

  it('propagates a rejected write without fabricating success or retrying the mutation', async () => {
    const failure = new Error('Server rejected the stale revision.');
    const approve = vi.fn().mockRejectedValue(failure);
    await expect(approveOrder(draft, true, 'attempt-1', { approve })).rejects.toBe(failure);
    expect(approve).toHaveBeenCalledOnce();
  });

  it.each([
    { ...draft, id: 'another-order', status: 'approved', revision: 8 },
    { ...draft, status: 'draft', revision: 8 },
    { ...draft, status: 'approved', revision: 7 },
    { ...draft, status: 'approved', revision: 8, totalMinor: 1 },
  ] satisfies Order[])('rejects a mismatched response $id/$revision/$status', async (reply) => {
    await expect(
      approveOrder(draft, true, 'attempt-1', { approve: () => Promise.resolve(reply) }),
    ).rejects.toThrow('expected transition');
  });
});
