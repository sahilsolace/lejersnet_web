import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, XCircle } from 'lucide-react';
import { subscriptionApi, useDB } from '@/lib/store';
import { Badge, Button, Card, EmptyState } from '@/components/ui';
import { ConfirmDialog } from '@/components/Modal';
import { useState } from 'react';
import { useToast } from '@/components/Toast';
import { formatDate, formatDKK } from '@/lib/constants';
import type { Subscription } from '@/types';

export function SubscriptionsPage() {
  const db = useDB();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cancelTarget, setCancelTarget] = useState<Subscription | null>(null);

  const cancel = (s: Subscription) => {
    subscriptionApi.cancel(s.id);
    toast('Subscription cancelled.', 'success');
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/profile')}
          className="p-2 rounded-lg hover:bg-bg text-ink-muted"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-semibold text-ink">My Subscriptions</h1>
      </div>

      {db.subscriptions.length === 0 ? (
        <Card>
          <EmptyState
            icon={<CreditCard size={24} />}
            title="No subscriptions"
            description="Become a member to start storing your tenancy documents."
            action={
              <Button size="sm" onClick={() => navigate('/subscribe')}>
                Become a Member
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {db.subscriptions.map((s) => (
            <Card key={s.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-ink">{s.plan_name}</p>
                    <StatusBadge status={s.status} />
                  </div>
                  <p className="text-xs text-ink-muted mt-1">
                    {formatDKK(s.amount_dkk)} / month
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-ink-muted">Started</p>
                      <p className="text-ink font-medium">{formatDate(s.started_at)}</p>
                    </div>
                    {s.status === 'active' && (
                      <div>
                        <p className="text-ink-muted">Renews</p>
                        <p className="text-ink font-medium">{formatDate(s.renews_at)}</p>
                      </div>
                    )}
                    {s.ends_at && (
                      <div>
                        <p className="text-ink-muted">Ended</p>
                        <p className="text-ink font-medium">{formatDate(s.ends_at)}</p>
                      </div>
                    )}
                  </div>
                </div>
                {s.status === 'active' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCancelTarget(s)}
                    className="!text-danger !border-danger/30 hover:!bg-danger/5"
                  >
                    <XCircle size={14} /> Cancel
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => cancelTarget && cancel(cancelTarget)}
        title="Cancel subscription"
        message="Your membership will end immediately. You can re-subscribe anytime."
        confirmLabel="Cancel subscription"
        danger
      />
    </div>
  );
}

function StatusBadge({ status }: { status: Subscription['status'] }) {
  if (status === 'active') return <Badge color="success">Active</Badge>;
  if (status === 'past_due') return <Badge color="warning">Past due</Badge>;
  return <Badge color="muted">Cancelled</Badge>;
}
