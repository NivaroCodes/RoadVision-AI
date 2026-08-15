import { MapView } from '@/features/map';

export default function MapPage() {
  return (
    <div className="-m-4 flex h-[calc(100vh-4rem)] flex-col animate-in fade-in duration-500 sm:-m-6 lg:-m-8">
      <div className="flex-1 w-full h-full">
        <MapView />
      </div>
    </div>
  );
}
