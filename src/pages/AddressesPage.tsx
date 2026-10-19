import { useState } from 'react';
import { Plus, Search, MapPin, Edit2, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { addressApi, useDB } from '@/lib/store';
import { CATEGORIES } from '@/lib/constants';
import { Badge, Button, Card, EmptyState, Input } from '@/components/ui';
import { Modal, ConfirmDialog } from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { useNavigate } from 'react-router-dom';
import type { Address, MoveType } from '@/types';

export function AddressesPage() {
  const db = useDB();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<Address | null>(null);
  const [adding, setAdding] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Address | null>(null);

  const filtered = db.addresses.filter((a) => {
    const s = `${a.title} ${a.street} ${a.city} ${a.postcode}`.toLowerCase();
    return s.includes(q.toLowerCase());
  });

  const remove = (a: Address) => {
    addressApi.remove(a.id);
    toast('Address removed.', 'success');
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">Housing directory</h1>
          <p className="text-sm text-ink-muted">All addresses you've lived in or tracked.</p>
        </div>
        <Button onClick={() => setAdding(true)} size="sm">
          <Plus size={16} /> Add
        </Button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted/60" />
        <Input
          placeholder="Search addresses…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
          aria-label="Search addresses"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<MapPin size={24} />}
            title="No addresses yet"
            description="Add your first address to start tracking move-in and move-out photos."
            action={
              <Button size="sm" onClick={() => setAdding(true)}>
                <Plus size={16} /> Add address
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => {
            const insps = db.inspections.filter((i) => i.address_id === a.id);
            const mediaCount = db.media.filter((m) =>
              insps.some((i) => i.id === m.inspection_id)
            ).length;
            return (
              <Card key={a.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-ink truncate">{a.title}</p>
                      <Badge color={a.status === 'active' ? 'success' : 'muted'}>
                        {a.status === 'active' ? 'Active' : 'Previous'}
                      </Badge>
                    </div>
                    <p className="text-xs text-ink-muted mt-1 truncate">
                      {a.street}, {a.postcode} {a.city}
                    </p>
                    <p className="text-xs text-ink-muted mt-1">
                      {mediaCount} {mediaCount === 1 ? 'file' : 'files'} ·{' '}
                      {insps.length} inspections
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditing(a)}
                      className="p-2 rounded-lg text-ink-muted hover:bg-bg hover:text-ink"
                      aria-label="Edit"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(a)}
                      className="p-2 rounded-lg text-ink-muted hover:bg-danger/10 hover:text-danger"
                      aria-label="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/upload/${a.id}/MOVE_IN`)}
                  >
                    <ArrowRight size={14} /> Move In
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/upload/${a.id}/MOVE_OUT`)}
                  >
                    <ArrowLeft size={14} /> Move Out
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <AddressModal
        open={adding || !!editing}
        address={editing}
        onClose={() => {
          setAdding(false);
          setEditing(null);
        }}
        onSave={(data) => {
          if (editing) {
            addressApi.update(editing.id, data);
            toast('Address updated.', 'success');
          } else {
            addressApi.add(data);
            toast('Address added.', 'success');
          }
          setAdding(false);
          setEditing(null);
        }}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && remove(confirmDelete)}
        title="Delete address"
        message={`Delete "${confirmDelete?.title}"? This also removes its inspections and files. This cannot be undone.`}
        confirmLabel="Delete"
        danger
      />

      <p className="text-xs text-ink-muted text-center pt-2">
        Categories: {CATEGORIES.map((c) => c.label).join(' · ')}
      </p>
    </div>
  );
}

function AddressModal({
  open,
  address,
  onClose,
  onSave,
}: {
  open: boolean;
  address: Address | null;
  onClose: () => void;
  onSave: (data: Omit<Address, 'id'>) => void;
}) {
  const [form, setForm] = useState<Omit<Address, 'id'>>({
    title: '',
    street: '',
    city: '',
    postcode: '',
    status: 'active',
  });

  // Sync when opening
  useState(() => {
    if (address) {
      setForm({
        title: address.title,
        street: address.street,
        city: address.city,
        postcode: address.postcode,
        status: address.status,
      });
    } else {
      setForm({ title: '', street: '', city: '', postcode: '', status: 'active' });
    }
  });

  // Re-sync on open
  const [lastOpen, setLastOpen] = useState(false);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) {
      if (address) {
        setForm({
          title: address.title,
          street: address.street,
          city: address.city,
          postcode: address.postcode,
          status: address.status,
        });
      } else {
        setForm({ title: '', street: '', city: '', postcode: '', status: 'active' });
      }
    }
  }

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={address ? 'Edit address' : 'Add address'}
    >
      <div className="space-y-3">
        <Input
          label="Title"
          placeholder="e.g. City Studio"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
        />
        <Input
          label="Street"
          placeholder="Street and number"
          value={form.street}
          onChange={(e) => set('street', e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Postcode"
            placeholder="1620"
            value={form.postcode}
            onChange={(e) => set('postcode', e.target.value)}
          />
          <Input
            label="City"
            placeholder="Copenhagen"
            value={form.city}
            onChange={(e) => set('city', e.target.value)}
          />
        </div>
        <div>
          <span className="block text-xs font-medium text-ink-muted mb-1.5">Status</span>
          <div className="flex gap-2">
            {(['active', 'previous'] as const).map((s) => (
              <button
                key={s}
                onClick={() => set('status', s)}
                className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors capitalize ${
                  form.status === s
                    ? 'bg-navy text-white border-navy'
                    : 'bg-white text-ink-muted border-border'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!form.title.trim()) return;
              onSave(form);
            }}
          >
            {address ? 'Save changes' : 'Add address'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
