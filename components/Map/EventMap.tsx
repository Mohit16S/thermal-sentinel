'use client';

import dynamic from 'next/dynamic';
import type {Event} from '@/types';

export interface EventMapProps {
  events: Event[];
  selected?: string;
  onSelect?: (event: Event) => void;
}

const LeafletEventMap = dynamic(() => import('./LeafletEventMap'), {
  ssr: false,
  loading: () => <div className="panel grid h-full min-h-64 place-items-center text-xs text-[#86a0a6]">Loading geographic context…</div>,
});

export default function EventMap(props: EventMapProps) {
  return <LeafletEventMap {...props}/>;
}
