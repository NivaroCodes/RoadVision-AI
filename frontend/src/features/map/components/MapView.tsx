import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

// Custom div icon for professional look
const createDefectIcon = (severity: string) => {
  const colors = {
    critical: 'bg-red-500 shadow-red-500/50',
    high: 'bg-orange-500 shadow-orange-500/50',
    medium: 'bg-yellow-500 shadow-yellow-500/50',
    low: 'bg-blue-500 shadow-blue-500/50'
  };
  
  const colorClass = colors[severity as keyof typeof colors] || colors.medium;
  
  return L.divIcon({
    className: 'custom-defect-marker',
    html: `<div class="relative flex h-5 w-5 items-center justify-center">
             <span class="animate-ping absolute inline-flex h-full w-full rounded-full ${colorClass} opacity-75"></span>
             <span class="relative inline-flex rounded-full h-3 w-3 ${colorClass.split(' ')[0]} shadow-lg"></span>
           </div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

export function MapView() {
  const position: [number, number] = [42.3417, 69.5901];

  return (
    <MapContainer 
      center={position} 
      zoom={13} 
      className="w-full h-full z-0"
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      
      {/* Mock Defect Marker */}
      <Marker position={[42.3417, 69.5901]} icon={createDefectIcon('critical')}>
        <Popup className="defect-popup">
          <div className="p-2 min-w-[200px]">
            <div className="flex items-center gap-2 mb-3 font-bold text-red-500 text-base border-b border-border/50 pb-2">
              <AlertTriangle className="h-5 w-5" />
              Критическая яма
            </div>
            <div className="space-y-1.5">
              <p className="text-sm text-foreground flex justify-between">
                <span className="text-muted-foreground">Уверенность ИИ:</span>
                <span className="font-medium">98%</span>
              </p>
              <p className="text-sm text-foreground flex justify-between">
                <span className="text-muted-foreground">Координаты:</span>
                <span className="font-medium text-xs">42.3417, 69.5901</span>
              </p>
            </div>
          </div>
        </Popup>
      </Marker>
      
      <Marker position={[42.3350, 69.5850]} icon={createDefectIcon('high')}>
        <Popup className="defect-popup">
          <div className="p-2 min-w-[200px]">
            <div className="flex items-center gap-2 mb-3 font-bold text-orange-500 text-base border-b border-border/50 pb-2">
              <AlertCircle className="h-5 w-5" />
              Глубокая трещина
            </div>
            <div className="space-y-1.5">
              <p className="text-sm text-foreground flex justify-between">
                <span className="text-muted-foreground">Уверенность ИИ:</span>
                <span className="font-medium">89%</span>
              </p>
            </div>
          </div>
        </Popup>
      </Marker>
      
      <Marker position={[42.3480, 69.6000]} icon={createDefectIcon('low')}>
        <Popup className="defect-popup">
          <div className="p-2 min-w-[200px]">
            <div className="flex items-center gap-2 mb-3 font-bold text-blue-500 text-base border-b border-border/50 pb-2">
              <Info className="h-5 w-5" />
              Мелкая сетка
            </div>
            <div className="space-y-1.5">
              <p className="text-sm text-foreground flex justify-between">
                <span className="text-muted-foreground">Уверенность ИИ:</span>
                <span className="font-medium">65%</span>
              </p>
            </div>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
