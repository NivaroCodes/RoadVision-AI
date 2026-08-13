import { useMemo, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';
import { DefectMarker } from './DefectMarker';
import { MapFilters } from './MapFilters';
import { mockDefects } from '../mock/defects';
import type { DefectMarker as DefectMarkerData, MapFilterValues } from '../types';
import '../map.css';

const SHYMKENT_CENTER: [number, number] = [42.3417, 69.5901];
const INITIAL_FILTERS: MapFilterValues = {
  type: 'all',
  severity: 'all',
  status: 'all',
};

interface MapViewProps {
  defects?: readonly DefectMarkerData[];
}

export function MapView({ defects = mockDefects }: MapViewProps) {
  const [filters, setFilters] = useState<MapFilterValues>(INITIAL_FILTERS);

  const filteredDefects = useMemo(
    () =>
      defects.filter(
        (defect) =>
          (filters.type === 'all' || defect.type === filters.type) &&
          (filters.severity === 'all' || defect.severity === filters.severity) &&
          (filters.status === 'all' || defect.status === filters.status),
      ),
    [defects, filters],
  );

  return (
    <section className="relative flex h-full min-h-[520px] w-full min-w-0 overflow-hidden bg-background">
      <MapFilters
        filters={filters}
        resultCount={filteredDefects.length}
        totalCount={defects.length}
        onChange={setFilters}
        onReset={() => setFilters(INITIAL_FILTERS)}
      />

      <div className="map-legend absolute bottom-7 left-3 z-[500] rounded-lg border px-3 py-2 shadow-lg backdrop-blur sm:left-4" aria-label="Defect severity legend">
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Severity</p>
        <ul className="flex gap-3 text-xs font-medium text-foreground">
          <li><span className="legend-dot bg-green-500" />Low</li>
          <li><span className="legend-dot bg-orange-500" />Medium</li>
          <li><span className="legend-dot bg-red-500" />High</li>
        </ul>
      </div>

      {filteredDefects.length === 0 ? (
        <div className="map-empty-state pointer-events-none absolute left-1/2 top-1/2 z-[500] w-[min(320px,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-xl border p-5 text-center shadow-xl backdrop-blur" role="status">
          <p className="font-semibold text-foreground">No defects found</p>
          <p className="mt-1 text-sm text-muted-foreground">Change or reset the filters to see map markers.</p>
        </div>
      ) : null}

      <MapContainer
        center={SHYMKENT_CENTER}
        zoom={12}
        className="h-full min-h-[520px] w-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MarkerClusterGroup chunkedLoading showCoverageOnHover={false}>
          {filteredDefects.map((defect) => (
            <DefectMarker key={defect.id} defect={defect} />
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </section>
  );
}
