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
      />

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
