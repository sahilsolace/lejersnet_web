import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search, Download, Trash2, MapPin, Plus } from 'lucide-react';
import { useDB, mediaApi } from '@/lib/store';
import { CATEGORIES, formatDate, formatBytes } from '@/lib/constants';
import { Badge, Button, Card, Chip, EmptyState, Input } from '@/components/ui';
import { Modal, ConfirmDialog } from '@/components/Modal';
import { useToast } from '@/components/Toast';
import type { CategoryId, MediaItem } from '@/types';

export function DocumentsPage() {
  const db = useDB();
  const { toast } = useToast();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<CategoryId | 'all'>('all');
  const [preview, setPreview] = useState<MediaItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<MediaItem | null>(null);

  const docs = useMemo(
    () =>
      db.media
        .filter((m) => m.kind === 'DOCUMENT')
        .filter((m) => (cat === 'all' ? true : m.category_id === cat))
        .filter((m) => m.name.toLowerCase().includes(q.toLowerCase())),
    [db.media, cat, q]
  );

  const byAddress = useMemo(() => {
    const map = new Map<string, { title: string; items: MediaItem[] }>();
    docs.forEach((d) => {
      const insp = db.inspections.find((i) => i.id === d.inspection_id);
      const addr = db.addresses.find((a) => a.id === insp?.address_id);
      const key = addr?.id ?? 'unknown';
      if (!map.has(key))
        map.set(key, { title: addr?.title ?? 'Unknown address', items: [] });
      map.get(key)!.items.push(d);
    });
    return Array.from(map.values());
  }, [docs, db.inspections, db.addresses]);

  const deleteDoc = (m: MediaItem) => {
    mediaApi.remove(m.id);
    setConfirmDelete(null);
    setPreview(null);
    toast('Document deleted.', 'success');
  };

  const docCats = CATEGORIES.filter((c) => c.group === 'documents' || c.id === 'lease_contract');

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">Documents</h1>
          <p className="text-sm text-ink-muted">
            {docs.length} {docs.length === 1 ? 'document' : 'documents'} saved
          </p>
        </div>
        <Link to="/addresses">
          <Button size="sm">
            <Plus size={16} /> Add
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted/60" />
        <Input
          placeholder="Search documents…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
          aria-label="Search documents"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
        <Chip active={cat === 'all'} onClick={() => setCat('all')}>
          All
        </Chip>
        {docCats.map((c) => (
          <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>
            {c.label}
          </Chip>
        ))}
      </div>

      {docs.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FileText size={24} />}
            title="No documents yet"
            description="Upload lease contracts and other documents from an address's Move-In or Move-Out screen."
            action={
              <Link to="/addresses">
                <Button size="sm">Go to addresses</Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="space-y-5">
          {byAddress.map((group) => (
            <div key={group.title}>
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={14} className="text-ink-muted" />
                <h2 className="text-sm font-semibold text-ink">{group.title}</h2>
              </div>
              <Card className="divide-y divide-border">
                {group.items.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setPreview(d)}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-bg/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-navy/5 text-navy flex items-center justify-center shrink-0">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink truncate">{d.name}</p>
                      <p className="text-xs text-ink-muted mt-0.5">
                        {labelFor(d.category_id)} · {formatDate(d.taken_at)} · {formatBytes(d.size_bytes)}
                      </p>
                    </div>
                    <Badge color="muted">PDF</Badge>
                  </button>
                ))}
              </Card>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!preview} onClose={() => setPreview(null)} title={preview?.name} size="lg">
        {preview && (
          <div className="space-y-3">
            <div className="flex flex-col items-center justify-center py-10 bg-bg rounded-xl">
              <FileText size={48} className="text-navy mb-2" />
              <p className="text-sm font-medium text-ink">{preview.name}</p>
              <p className="text-xs text-ink-muted mt-1">
                {labelFor(preview.category_id)} · {formatBytes(preview.size_bytes)}
              </p>
              <p className="text-xs text-ink-muted">{formatDate(preview.taken_at)}</p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setConfirmDelete(preview)}>
                <Trash2 size={14} /> Delete
              </Button>
              <Button variant="outline" onClick={() => toast('Download started (mock).', 'info')}>
                <Download size={14} /> Download
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && deleteDoc(confirmDelete)}
        title="Delete document"
        message="This document will be permanently removed."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}

function labelFor(id: CategoryId) {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}
