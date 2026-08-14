import { MapView } from '@/features/map';

export default function MapPage() {
  return (
    <div className="h-[calc(100vh-theme(spacing.16))] flex flex-col -m-6 animate-in fade-in duration-500">
      <div className="flex-1 w-full h-full">
        <MapView />
      </div>
    </div>
  );
}
