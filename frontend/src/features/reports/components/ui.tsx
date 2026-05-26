import { ReactNode } from 'react';
import { X } from 'lucide-react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[22px] bg-white p-4 shadow-[0_8px_22px_rgba(35,31,32,0.08)] ${className}`}>{children}</section>;
}

export function EmptyState({ message }: { message: string }) {
  return <div className="rounded-2xl border border-dashed border-prime-line bg-prime-cream/30 p-4 text-sm text-prime-black/70">{message}</div>;
}

export function LoadingSkeleton() {
  return <div className="h-28 animate-pulse rounded-2xl bg-prime-cream/40" aria-label="loading" />;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <Card><p className="text-sm text-red-700">{message}</p><button onClick={onRetry} className="mt-3 rounded-xl bg-prime-black px-4 py-2 text-sm text-white">Coba lagi</button></Card>;
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4" onClick={onClose}>
      <div className="w-full max-w-[410px] rounded-[24px] bg-white p-4" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between"><h3 className="font-bold">{title}</h3><button aria-label="Tutup modal" onClick={onClose}><X size={18} /></button></div>
        {children}
      </div>
    </div>
  );
}

export function Toast({ text }: { text: string }) {
  return <div className="fixed bottom-[calc(116px+env(safe-area-inset-bottom))] left-1/2 z-50 -translate-x-1/2 rounded-xl bg-prime-black px-4 py-2 text-sm text-white">{text}</div>;
}
