import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Download } from 'lucide-react';
import { useDB } from '@/lib/store';
import { Badge, Button, Card, EmptyState } from '@/components/ui';
import { useToast } from '@/components/Toast';
import { formatDate, formatDKK } from '@/lib/constants';
import type { Order } from '@/types';

export function OrdersPage() {
  const db = useDB();
  const navigate = useNavigate();
  const { toast } = useToast();

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
        <h1 className="text-xl font-semibold text-ink">My Orders</h1>
      </div>

      {db.orders.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ShoppingBag size={24} />}
            title="No orders yet"
            description="Your membership orders will appear here."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {db.orders.map((o) => (
            <OrderCard key={o.id} order={o} onInvoice={() => toast('Invoice download (mock).', 'info')} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, onInvoice }: { order: Order; onInvoice: () => void }) {
  const statusColor =
    order.status === 'paid' ? 'success' : order.status === 'refunded' ? 'muted' : 'danger';
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">{order.number}</p>
          <p className="text-xs text-ink-muted mt-0.5">{formatDate(order.date)}</p>
        </div>
        <Badge color={statusColor}>
          {order.status === 'paid'
            ? 'Paid'
            : order.status === 'refunded'
            ? 'Refunded'
            : 'Failed'}
        </Badge>
      </div>
      <div className="mt-3 divide-y divide-border border-t border-border">
        {order.items.map((it, i) => (
          <div key={i} className="flex items-center justify-between py-2 text-sm">
            <span className="text-ink">{it.description}</span>
            <span className="text-ink font-medium">{formatDKK(it.amount_dkk)}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-ink-muted">Total</p>
          <p className="text-base font-semibold text-ink">{formatDKK(order.amount_dkk)}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-ink-muted">{order.payment_method}</span>
          <Button size="sm" variant="outline" onClick={onInvoice}>
            <Download size={14} /> Invoice
          </Button>
        </div>
      </div>
    </Card>
  );
}
