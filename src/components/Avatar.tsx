import { initials } from '@/lib/constants';

export function Avatar({
  name,
  src,
  size = 40,
}: {
  name: string;
  src?: string;
  size?: number;
}) {
  const dim = { width: size, height: size };
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={dim}
        className="rounded-full object-cover bg-bg"
      />
    );
  }
  return (
    <div
      style={dim}
      className="rounded-full bg-navy text-white flex items-center justify-center font-semibold"
    >
      <span style={{ fontSize: size * 0.38 }}>{initials(name)}</span>
    </div>
  );
}
