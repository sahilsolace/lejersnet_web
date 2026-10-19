import { useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Camera, FileText, Upload, X, Trash2, Download, Eye, GitCompare,
} from 'lucide-react';
import {
  inspectionApi, mediaApi, useDB,
} from '@/lib/store';
import {
  CATEGORIES, formatDate, formatBytes, moveTypeLabel,
} from '@/lib/constants';
import { Badge, Button, Card, Chip, EmptyState } from '@/components/ui';
import { Modal, ConfirmDialog } from '@/components/Modal';
import { useToast } from '@/components/Toast';
import type { CategoryId, MediaItem, MediaKind, MoveType } from '@/types';

export function UploadPage() {
  const params = useParams<{ addressId: string; moveType: string }>();
  const [search] = useSearchParams();
  const focusCat = search.get('focus') as CategoryId | null;
  const navigate = useNavigate();
  const { toast } = useToast();
  const db = useDB();

  const addressId = params.addressId!;
  const moveType = (params.moveType as MoveType) ?? 'MOVE_IN';
  const address = db.addresses.find((a) => a.id === addressId);

  const [activeCat, setActiveCat] = useState<CategoryId>(
    focusCat ?? CATEGORIES[0].id
  );
  const [pending, setPending] = useState<
    { name: string; kind: MediaKind; size: number; dataUrl: string }[]
  >([]);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<MediaItem | null>(null);
  const [gallery, setGallery] = useState<{ cat: CategoryId } | null>(null);
  const [compare, setCompare] = useState<{ cat: CategoryId } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<MediaItem | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);

  const inspectionId = useMemo(
    () => inspectionApi.ensure(addressId, moveType),
    [addressId, moveType]
  );

  const inspection = db.inspections.find((i) => i.id === inspectionId);
  const previousUploads = inspection
    ? db.media.filter((m) => m.inspection_id === inspection.id)
    : [];

  const catsWithUploads = new Set(previousUploads.map((m) => m.category_id));
  const missed = CATEGORIES.filter((c) => !catsWithUploads.has(c.id));

  const handleFiles = (files: FileList | null, kind: MediaKind) => {
    if (!files) return;
    const arr = Array.from(files).slice(0, 8);
    Promise.all(
      arr.map(
        (f) =>
          new Promise<{ name: string; kind: MediaKind; size: number; dataUrl: string }>(
            (resolve) => {
              const reader = new FileReader();
              reader.onload = () =>
                resolve({
                  name: f.name,
                  kind,
                  size: f.size,
                  dataUrl: reader.result as string,
                });
              reader.readAsDataURL(f);
            }
          )
      )
    ).then((items) => setPending((p) => [...p, ...items]));
  };

  const save = async () => {
    if (pending.length === 0) {
      toast('Add some pictures or documents first.', 'warning');
      return;
    }
    setUploading(true);
    await new Promise((r) => setTimeout(r, 600));
    mediaApi.addMany(
      pending.map((p) => ({
        inspection_id: inspectionId,
        category_id: activeCat,
        kind: p.kind,
        name: p.name,
        file_url: p.dataUrl,
        thumb_url: p.dataUrl,
        size_bytes: p.size,
        taken_at: new Date().toISOString(),
      }))
    );
    setPending([]);
    setUploading(false);
    toast(`Saved ${pending.length} ${pending.length === 1 ? 'file' : 'files'} to ${labelFor(activeCat)}.`, 'success');
  };

  const deleteMedia = (m: MediaItem) => {
    mediaApi.remove(m.id);
    setConfirmDelete(null);
    setPreview(null);
    toast('File deleted.', 'success');
  };

  if (!address) {
    return (
      <Card>
        <EmptyState
          icon={<ArrowLeft size={24} />}
          title="Address not found"
          action={<Button onClick={() => navigate('/addresses')}>Back to addresses</Button>}
        />
      </Card>
    );
  }

  const galleryItems = gallery
    ? previousUploads.filter((m) => m.category_id === gallery.cat)
    : [];

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/addresses')}
          className="p-2 rounded-lg hover:bg-bg text-ink-muted"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-semibold text-ink truncate">{address.title}</h1>
            <Badge color="navy">{moveTypeLabel(moveType)}</Badge>
          </div>
          <p className="text-xs text-ink-muted truncate">
            {address.street}, {address.postcode} {address.city}
            {inspection && ` · ${formatDate(inspection.date)}`}
          </p>
        </div>
      </div>

      {/* Category picker */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
        {CATEGORIES.map((c) => (
          <Chip
            key={c.id}
            active={activeCat === c.id}
            onClick={() => setActiveCat(c.id)}
            icon={
              catsWithUploads.has(c.id) ? (
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
              ) : undefined
            }
          >
            {c.label}
          </Chip>
        ))}
      </div>

      {/* Upload zone */}
      <Card className="p-4">
        <p className="text-sm font-semibold text-ink mb-3">
          Add to {labelFor(activeCat)}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => camRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 py-5 rounded-xl border-2 border-dashed border-border hover:border-accent hover:bg-accent/5 transition-colors"
          >
            <Camera size={22} className="text-accent" />
            <span className="text-sm font-medium text-ink">Take photo</span>
            <span className="text-xs text-ink-muted">Camera</span>
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 py-5 rounded-xl border-2 border-dashed border-border hover:border-navy hover:bg-navy/5 transition-colors"
          >
            <Upload size={22} className="text-navy" />
            <span className="text-sm font-medium text-ink">Upload</span>
            <span className="text-xs text-ink-muted">PDF, DOC, JPG, PNG</span>
          </button>
        </div>
        <input
          ref={camRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files, 'PICTURE')}
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = e.target.files;
            if (!files) return;
            Array.from(files).forEach((f) => {
              const isImg = f.type.startsWith('image/');
              const reader = new FileReader();
              reader.onload = () =>
                setPending((p) => [
                  ...p,
                  {
                    name: f.name,
                    kind: isImg ? 'PICTURE' : 'DOCUMENT',
                    size: f.size,
                    dataUrl: reader.result as string,
                  },
                ]);
              reader.readAsDataURL(f);
            });
          }}
        />

        {pending.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-medium text-ink-muted">
              {pending.length} ready to save
            </p>
            <div className="grid grid-cols-3 gap-2">
              {pending.map((p, i) => (
                <div
                  key={i}
                  className="relative rounded-xl overflow-hidden border border-border aspect-square bg-bg"
                >
                  {p.kind === 'PICTURE' ? (
                    <img src={p.dataUrl} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                      <FileText size={20} className="text-navy mb-1" />
                      <span className="text-[10px] text-ink-muted truncate w-full">
                        {p.name}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() =>
                      setPending((prev) => prev.filter((_, idx) => idx !== i))
                    }
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center"
                    aria-label="Remove"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
            <Button onClick={save} loading={uploading} className="w-full mt-2">
              Save to {labelFor(activeCat)}
            </Button>
          </div>
        )}
      </Card>

      {/* Missed sections */}
      {missed.length > 0 && (
        <Card className="p-4 bg-warning/5 border-warning/20">
          <p className="text-sm font-semibold text-warning flex items-center gap-2">
            {missed.length} section{missed.length === 1 ? '' : 's'} still empty
          </p>
          <p className="text-xs text-ink-muted mt-1">
            These will appear on your Home page as "Needs attention".
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {missed.map((c) => (
              <Chip key={c.id} onClick={() => setActiveCat(c.id)}>
                {c.label}
              </Chip>
            ))}
          </div>
        </Card>
      )}

      {/* Previous uploads */}
      <div>
        <p className="text-sm font-semibold text-ink mb-3">Previous uploads</p>
        {previousUploads.length === 0 ? (
          <Card>
            <EmptyState
              icon={<FileText size={24} />}
              title="Nothing uploaded yet"
              description="Your uploads for this address will appear here, grouped by category."
            />
          </Card>
        ) : (
          <div className="space-y-2">
            {CATEGORIES.filter((c) => catsWithUploads.has(c.id)).map((c) => {
              const items = previousUploads.filter((m) => m.category_id === c.id);
              const pics = items.filter((m) => m.kind === 'PICTURE');
              return (
                <Card key={c.id} className="p-3">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      onClick={() => setGallery({ cat: c.id })}
                      className="flex items-center gap-3 flex-1 min-w-0 text-left"
                    >
                      <div className="flex -space-x-2">
                        {pics.slice(0, 3).map((p) => (
                          <img
                            key={p.id}
                            src={p.thumb_url}
                            alt={p.name}
                            className="w-9 h-9 rounded-lg object-cover border-2 border-white"
                          />
                        ))}
                        {pics.length === 0 && (
                          <div className="w-9 h-9 rounded-lg bg-navy/5 text-navy flex items-center justify-center">
                            <FileText size={16} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{c.label}</p>
                        <p className="text-xs text-ink-muted">
                          {items.length} {items.length === 1 ? 'file' : 'files'} ·{' '}
                          {formatDate(items[0].taken_at)}
                        </p>
                      </div>
                    </button>
                    {moveType === 'MOVE_OUT' && pics.length > 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setCompare({ cat: c.id })}
                      >
                        <GitCompare size={14} /> Compare
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Gallery modal */}
      <Modal
        open={!!gallery}
        onClose={() => setGallery(null)}
        title={gallery ? labelFor(gallery.cat) : ''}
        size="lg"
      >
        {gallery && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {galleryItems.map((m) => (
              <button
                key={m.id}
                onClick={() => setPreview(m)}
                className="group relative rounded-xl overflow-hidden border border-border bg-bg aspect-square text-left"
              >
                {m.kind === 'PICTURE' ? (
                  <img
                    src={m.thumb_url}
                    alt={m.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                    <FileText size={26} className="text-navy mb-1" />
                    <span className="text-[11px] text-ink-muted line-clamp-2">
                      {m.name}
                    </span>
                  </div>
                )}
                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/50 text-white text-[10px]">
                  {formatDate(m.taken_at)}
                </span>
              </button>
            ))}
          </div>
        )}
      </Modal>

      {/* Preview modal */}
      <Modal
        open={!!preview}
        onClose={() => setPreview(null)}
        title={preview?.name}
        size="lg"
      >
        {preview && (
          <div className="space-y-3">
            {preview.kind === 'PICTURE' ? (
              <img
                src={preview.file_url}
                alt={preview.name}
                className="w-full rounded-xl"
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center bg-bg rounded-xl">
                <FileText size={40} className="text-navy mb-2" />
                <p className="text-sm font-medium text-ink">{preview.name}</p>
                <p className="text-xs text-ink-muted mt-1">
                  {formatBytes(preview.size_bytes)} · {formatDate(preview.taken_at)}
                </p>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setConfirmDelete(preview)}>
                <Trash2 size={14} /> Delete
              </Button>
              <Button variant="outline" onClick={() => toast('Download started (mock).', 'info')}>
                <Download size={14} /> Download
              </Button>
              {preview.kind === 'PICTURE' && (
                <Button variant="outline" onClick={() => toast('Opened full screen (mock).', 'info')}>
                  <Eye size={14} /> Full screen
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Compare modal */}
      <Modal
        open={!!compare}
        onClose={() => setCompare(null)}
        title={compare ? `Compare – ${labelFor(compare.cat)}` : ''}
        size="lg"
      >
        {compare && <CompareView cat={compare.cat} addressId={addressId} />}
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && deleteMedia(confirmDelete)}
        title="Delete file"
        message="This file will be permanently removed from this inspection."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}

function CompareView({ cat, addressId }: { cat: CategoryId; addressId: string }) {
  const db = useDB();
  const moveIn = db.inspections.find(
    (i) => i.address_id === addressId && i.type === 'MOVE_IN'
  );
  const moveOut = db.inspections.find(
    (i) => i.address_id === addressId && i.type === 'MOVE_OUT'
  );
  const inPics = moveIn
    ? db.media.filter((m) => m.inspection_id === moveIn.id && m.category_id === cat && m.kind === 'PICTURE')
    : [];
  const outPics = moveOut
    ? db.media.filter((m) => m.inspection_id === moveOut.id && m.category_id === cat && m.kind === 'PICTURE')
    : [];

  const Col = ({ title, pics }: { title: string; pics: MediaItem[] }) => (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Badge color={title.includes('In') ? 'success' : 'navy'}>{title}</Badge>
        <span className="text-xs text-ink-muted">{pics.length}</span>
      </div>
      {pics.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-10 text-center text-xs text-ink-muted">
          No photos
        </div>
      ) : (
        <div className="space-y-2">
          {pics.map((p) => (
            <img
              key={p.id}
              src={p.thumb_url}
              alt={p.name}
              className="w-full rounded-xl border border-border"
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-4">
      <Col title="Move-In" pics={inPics} />
      <Col title="Move-Out" pics={outPics} />
    </div>
  );
}

function labelFor(id: CategoryId) {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}
