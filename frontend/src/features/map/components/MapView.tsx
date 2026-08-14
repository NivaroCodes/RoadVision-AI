import { useMemo, useState } from 'react';
import { MapContainer, TileLayer, ZoomControl, useMap } from 'react-leaflet';
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
  query: '',
  minConfidence: 0,
};

interface MapViewProps {
  defects?: readonly DefectMarkerData[];
  isLoading?: boolean;
  error?: string | null;
}

function RecenterControl() {
  const map = useMap();

  return (
    <button
      type="button"
      className="map-recenter-button absolute bottom-7 right-3 z-[500] rounded-lg border px-3 py-2 text-xs font-semibold shadow-lg backdrop-blur sm:right-4"
      onClick={() => map.setView(SHYMKENT_CENTER, 12, { animate: true })}
      aria-label="Center map on Shymkent"
    >
      Center Shymkent
    </button>
  );
}

export function MapView({ defects = mockDefects, isLoading = false, error = null }: MapViewProps) {
  const [filters, setFilters] = useState<MapFilterValues>(INITIAL_FILTERS);

  const filteredDefects = useMemo(() => {
    const query = filters.query.trim().toLocaleLowerCase();

    return defects.filter(
        (defect) => {
          const matchesQuery =
            query === '' ||
            String(defect.id).includes(query) ||
            defect.address?.toLocaleLowerCase().includes(query) === true;

          return matchesQuery &&
          (filters.type === 'all' || defect.type === filters.type) &&
          (filters.severity === 'all' || defect.severity === filters.severity) &&
          (filters.status === 'all' || defect.status === filters.status) &&
          defect.confidence * 100 >= filters.minConfidence;
        },
      );
  }, [defects, filters]);

  const severityCounts = useMemo(
    () => ({
      low: filteredDefects.filter((defect) => defect.severity === 'low').length,
      medium: filteredDefects.filter((defect) => defect.severity === 'medium').length,
      high: filteredDefects.filter((defect) => defect.severity === 'high').length,
    }),
    [filteredDefects],
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
          <li><span className="legend-dot bg-green-500" />Low {severityCounts.low}</li>
          <li><span className="legend-dot bg-orange-500" />Medium {severityCounts.medium}</li>
          <li><span className="legend-dot bg-red-500" />High {severityCounts.high}</li>
        </ul>
      </div>

      {isLoading ? (
        <div className="map-empty-state pointer-events-none absolute left-1/2 top-1/2 z-[500] w-[min(320px,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-xl border p-5 text-center shadow-xl backdrop-blur" role="status">
          <span className="map-loading-spinner mx-auto block" aria-hidden="true" />
          <p className="mt-3 font-semibold text-foreground">Loading defects…</p>
        </div>
      ) : error ? (
        <div className="map-empty-state pointer-events-none absolute left-1/2 top-1/2 z-[500] w-[min(320px,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-destructive/50 bg-destructive/10 p-5 text-center shadow-xl backdrop-blur" role="alert">
          <p className="font-semibold text-red-500">Ошибка загрузки дефектов</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        </div>
      ) : filteredDefects.length === 0 ? (
        <div className="map-empty-state pointer-events-none absolute left-1/2 top-1/2 z-[500] w-[min(320px,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-xl border p-5 text-center shadow-xl backdrop-blur" role="status">
          <p className="font-semibold text-foreground">Дефекты не найдены</p>
          <p className="mt-1 text-sm text-muted-foreground">Измените или сбросьте фильтры для отображения маркеров.</p>
        </div>
      ) : null}

        <MapContainer
          center={SHYMKENT_CENTER}
          zoom={12}
          className="h-full w-full z-0"
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
        <ZoomControl position="bottomright" />
        <RecenterControl />

        <MarkerClusterGroup chunkedLoading showCoverageOnHover={false}>
          {!isLoading && !error ? filteredDefects.map((defect) => (
            <DefectMarker key={defect.id} defect={defect} />
          )) : null}
        </MarkerClusterGroup>
      </MapContainer>
    </section>
  );
}
