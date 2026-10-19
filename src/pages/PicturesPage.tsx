import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Image as ImageIcon, Search, Plus, Trash2, Download, X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useDB, mediaApi } from '@/lib/store';
import { CATEGORIES, formatDate, moveTypeLabel } from '@/lib/constants';
import { Badge, Button, Card, Chip, EmptyState, Input } from '@/components/ui';
import { Modal, ConfirmDialog } from '@/components/Modal';
import { useToast } from '@/components/Toast';
import type { CategoryId, MediaItem, MoveType } from '@/types';

export function PicturesPage() {
  const db = useDB();
  const { toast } = useToast();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<CategoryId | 'all'>('all');
  const [grouped, setGrouped] = useState(true);
  const [viewer, setViewer] = useState<{ items: MediaItem[]; idx: number } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<MediaItem | null>(null);
  const [multiSelect, setMultiSelect] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const pics = useMemo(
    () =>
      db.media
        .filter((m) => m.kind === 'PICTURE')
        .filter((m) => (cat === 'all' ? true : m.category_id === cat))
        .filter((m) => m.name.toLowerCase().includes(q.toLowerCase()))
        .sort((a, b) => +new Date(b.taken_at) - +new Date(a.taken_at)),
    [db.media, cat, q]
  );

  const byAddress = useMemo(() => {
    const map = new Map<string, { title: string; items: MediaItem[] }>();
    pics.forEach((p) => {
      const insp = db.inspections.find((i) => i.id === p.inspection_id);
      const addr = db.addresses.find((a) => a.id === insp?.address_id);
      const key = addr?.id ?? 'unknown';
      if (!map.has(key))
        map.set(key, { title: addr?.title ?? 'Unknown', items: [] });
      map.get(key)!.items.push(p);
    });
    return Array.from(map.values());
  }, [pics, db.inspections, db.addresses]);

  const moveTypeFor = (m: MediaItem): MoveType | undefined =>
    db.inspections.find((i) => i.id === m.inspection_id)?.type;

  const toggleSelect = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const deleteSelected = () => {
    selected.forEach((id) => mediaApi.remove(id));
    toast(`${selected.size} picture${selected.size === 1 ? '' : 's'} deleted.`, 'success');
    setSelected(new Set());
    setMultiSelect(false);
    setConfirmDelete(null);
  };

  const deleteOne = (m: MediaItem) => {
    mediaApi.remove(m.id);
    setConfirmDelete(null);
    setViewer(null);
    toast('Picture deleted.', 'success');
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">Pictures</h1>
          <p className="text-sm text-ink-muted">
            {pics.length} {pics.length === 1 ? 'picture' : 'pictures'}
          </p>
        </div>
        <div className="flex gap-2">
          {pics.length > 0 && (
            <Button
              size="sm"
              variant={multiSelect ? 'secondary' : 'outline'}
              onClick={() => {
                setMultiSelect((v) => !v);
                setSelected(new Set());
              }}
            >
              <Check size={16} /> {multiSelect ? 'Done' : 'Select'}
            </Button>
          )}
          <Link to="/addresses">
            <Button size="sm">
              <Plus size={16} /> Add
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted/60" />
        <Input
          placeholder="Search pictures…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
          aria-label="Search pictures"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
        <Chip active={cat === 'all'} onClick={() => setCat('all')}>
          All
        </Chip>
        {CATEGORIES.filter((c) => c.group === 'rooms').map((c) => (
          <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>
            {c.label}
          </Chip>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-ink-muted">View:</span>
        <div className="inline-flex bg-bg rounded-xl p-1">
          <button
            onClick={() => setGrouped(true)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              grouped ? 'bg-white text-navy shadow-sm' : 'text-ink-muted'
            }`}
          >
            Grouped by address
          </button>
          <button
            onClick={() => setGrouped(false)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              !grouped ? 'bg-white text-navy shadow-sm' : 'text-ink-muted'
            }`}
          >
            All pictures
          </button>
        </div>
      </div>

      {multiSelect && selected.size > 0 && (
        <Card className="p-3 flex items-center justify-between bg-navy text-white border-navy">
          <span className="text-sm">{selected.size} selected</span>
          <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ id: 'multi' } as MediaItem)}>
            <Trash2 size={14} /> Delete
          </Button>
        </Card>
      )}

      {pics.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ImageIcon size={24} />}
            title="No pictures yet"
            description="Add pictures from an address's Move-In or Move-Out screen."
            action={
              <Link to="/addresses">
                <Button size="sm">Go to addresses</Button>
              </Link>
            }
          />
        </Card>
      ) : grouped ? (
        <div className="space-y-5">
          {byAddress.map((group) => (
            <div key={group.title}>
              <h2 className="text-sm font-semibold text-ink mb-2">{group.title}</h2>
              <div className="masonry">
                {group.items.map((p, i) => (
                  <PictureTile
                    key={p.id}
                    item={p}
                    moveType={moveTypeFor(p)}
                    selectable={multiSelect}
                    selected={selected.has(p.id)}
                    onToggle={() => toggleSelect(p.id)}
                    onOpen={() =>
                      setViewer({ items: group.items, idx: i })
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="masonry">
          {pics.map((p, i) => (
            <PictureTile
              key={p.id}
              item={p}
              moveType={moveTypeFor(p)}
              selectable={multiSelect}
              selected={selected.has(p.id)}
              onToggle={() => toggleSelect(p.id)}
              onOpen={() => setViewer({ items: pics, idx: i })}
            />
          ))}
        </div>
      )}

      {/* Full-screen viewer */}
      {viewer && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col animate-fadeIn">
          <div className="flex items-center justify-between p-4 text-white">
            <button onClick={() => setViewer(null)} className="p-2">
              <X size={22} />
            </button>
            <span className="text-sm">
              {viewer.idx + 1} / {viewer.items.length}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => toast('Download started (mock).', 'info')}
                className="p-2"
                aria-label="Download"
              >
                <Download size={20} />
              </button>
              <button
                onClick={() => setConfirmDelete(viewer.items[viewer.idx])}
                className="p-2"
                aria-label="Delete"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center relative px-2">
            <button
              onClick={() =>
                setViewer((v) =>
                  v ? { ...v, idx: (v.idx - 1 + v.items.length) % v.items.length } : v
                )
              }
              className="absolute left-2 p-2 text-white/80 hover:text-white"
              aria-label="Previous"
            >
              <ChevronLeft size={28} />
            </button>
            <img
              src={viewer.items[viewer.idx].file_url}
              alt={viewer.items[viewer.idx].name}
              className="max-h-full max-w-full object-contain rounded-lg"
            />
            <button
              onClick={() =>
                setViewer((v) => (v ? { ...v, idx: (v.idx + 1) % v.items.length } : v))
              }
              className="absolute right-2 p-2 text-white/80 hover:text-white"
              aria-label="Next"
            >
              <ChevronRight size={28} />
            </button>
          </div>
          <div className="p-4 text-center text-white/80 text-sm">
            <p className="font-medium">{viewer.items[viewer.idx].name}</p>
            <p className="text-xs text-white/50 mt-1">
              {formatDate(viewer.items[viewer.idx].taken_at)} ·{' '}
              {moveTypeFor(viewer.items[viewer.idx]) === 'MOVE_IN' ? 'Move-In' : 'Move-Out'}
            </p>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() =>
          confirmDelete && confirmDelete.id === 'multi'
            ? deleteSelected()
            : confirmDelete && deleteOne(confirmDelete)
        }
        title={
          confirmDelete?.id === 'multi'
            ? `Delete ${selected.size} pictures`
            : 'Delete picture'
        }
        message={
          confirmDelete?.id === 'multi'
            ? `Remove ${selected.size} selected pictures? This cannot be undone.`
            : 'This picture will be permanently removed.'
        }
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}

function PictureTile({
  item,
  moveType,
  selectable,
  selected,
  onToggle,
  onOpen,
}: {
  item: MediaItem;
  moveType?: MoveType;
  selectable: boolean;
  selected: boolean;
  onToggle: () => void;
  onOpen: () => void;
}) {
  return (
    <div className="relative rounded-xl overflow-hidden bg-bg group cursor-pointer">
      <img
        src={item.thumb_url}
        alt={item.name}
        onClick={selectable ? onToggle : onOpen}
        className={`w-full block ${selectable && selected ? 'opacity-60' : ''}`}
        loading="lazy"
      />
      <span className="absolute top-1.5 left-1.5">
        <Badge color={moveType === 'MOVE_IN' ? 'success' : 'navy'}>
          {moveType ? moveTypeLabel(moveType) : ''}
        </Badge>
      </span>
      {selectable && (
        <button
          onClick={onToggle}
          className={`absolute top-1.5 right-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
            selected
              ? 'bg-accent border-accent text-white'
              : 'bg-black/30 border-white/70 text-transparent'
          }`}
          aria-label="Select"
        >
          <Check size={14} />
        </button>
      )}
      <span className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5 text-white text-[10px]">
        {formatDate(item.taken_at)}
      </span>
    </div>
  );
}
