import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layers, MapPinOff, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, ZoomControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { AddressSearch } from '@/features/geocoder';
import { DefectMarker } from './DefectMarker';
import { MapFilters } from './MapFilters';
import { useMapDefects } from '../hooks/useMapDefects';
import type { MapFilterValues } from '../types';
import { PanelHeader } from '@/components/layout/PanelHeader';
import { severityClasses, severityLabel, type Severity } from '@/lib/roadvision-data';
import { cn } from '@/lib/utils';
import '../map.css';

const SHYMKENT_CENTER: [number, number] = [42.3417, 69.5901];
const INITIAL_FILTERS: MapFilterValues = { type: 'all', severity: 'all', status: 'all', query: '', minConfidence: 0 };
const SEVERITY_KEYS: (Severity | 'all')[] = ['all', 'critical', 'high', 'medium', 'low'];

type MapLayerType = 'voyager' | 'dark';

function MapResizeHandler() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 400);
    const t3 = setTimeout(() => map.invalidateSize(), 1000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [map]);
  return null;
}

function RecenterControl() {
  const map = useMap();
  return (
    <button
      type="button"
      className="map-recenter-button absolute bottom-3 right-[130px] z-[500] rounded-lg border border-border bg-card/95 px-3 py-1.5 text-[11.5px] font-medium text-foreground shadow-panel backdrop-blur transition hover:bg-surface cursor-pointer"
      onClick={() => map.setView(SHYMKENT_CENTER, 12, { animate: true })}
      aria-label="Центрировать карту на Шымкенте"
    >
      Центр Шымкента
    </button>
  );
}

export function MapView() {
  const [searchParams] = useSearchParams();
  const fromParam = searchParams.get('from') || undefined;
  const toParam = searchParams.get('to') || undefined;
  
  const { data: defects = [], isLoading, error: queryError } = useMapDefects({ from: fromParam, to: toParam });
  const error = queryError ? 'Не удалось загрузить данные с сервера' : null;
  const [filters, setFilters] = useState<MapFilterValues>(INITIAL_FILTERS);
  const [activeLayer, setActiveLayer] = useState<MapLayerType>('dark');

  const filteredDefects = useMemo(() => {
    const query = filters.query.trim().toLocaleLowerCase();
    return defects.filter((defect) => 
      (query === '' || String(defect.id).includes(query) || defect.address?.toLocaleLowerCase().includes(query) === true) && 
      (filters.type === 'all' || defect.type === filters.type) && 
      (filters.severity === 'all' || defect.severity === filters.severity) && 
      (filters.status === 'all' || defect.status === filters.status) && 
      (defect.confidence ?? 0) * 100 >= filters.minConfidence
    );
  }, [defects, filters]);

  const toggleHeaderSeverity = (s: Severity | 'all') => {
    setFilters((prev) => ({
      ...prev,
      severity: s === prev.severity ? 'all' : s,
    }));
  };

  return (
    <div className="space-y-4 md:space-y-5">
      <MapFilters
        filters={filters}
        resultCount={filteredDefects.length}
        totalCount={defects.length}
        onChange={setFilters}
        onReset={() => setFilters(INITIAL_FILTERS)}
      />

      <section className="panel flex flex-col overflow-hidden">
        <PanelHeader
          title="Карта дорожной сети"
          meta={`Под наблюдением 1 248 км · ${defects.length} дефектов`}
          action={
            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex items-center rounded-lg border border-border bg-card p-0.5 text-[11px] font-medium">
                <button
                  type="button"
                  onClick={() => setActiveLayer('voyager')}
                  className={cn(
                    "rounded-md px-2 py-1 transition-colors cursor-pointer",
                    activeLayer === 'voyager' ? "bg-surface-2 text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Светлая
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLayer('dark')}
                  className={cn(
                    "rounded-md px-2 py-1 transition-colors cursor-pointer",
                    activeLayer === 'dark' ? "bg-surface-2 text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Тёмная
                </button>
              </div>

              <div className="h-4 w-px bg-border mx-1" />

              {SEVERITY_KEYS.map((f) => {
                const active = filters.severity === f;
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggleHeaderSeverity(f)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer",
                      active
                        ? "border-border-strong bg-surface-2 text-foreground"
                        : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {f !== 'all' && (
                      <span
                        className={cn("size-1.5 rounded-full", severityClasses[f as Severity]?.dot)}
                      />
                    )}
                    {f === 'all' ? 'Все' : severityLabel[f as Severity]}
                  </button>
                );
              })}
            </div>
          }
        />

        <div className="relative z-0 h-[calc(100vh-320px)] min-h-[500px] w-full shrink-0 bg-background/50">
          {isLoading ? (
            <div className="map-loading-overlay pointer-events-none absolute inset-0 z-[500] flex items-center justify-center p-4" role="status" aria-label="Загрузка карты">
              <div className="w-full max-w-sm rounded-xl border border-border bg-card/90 p-5 shadow-panel backdrop-blur">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="mt-3 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-4/5" />
              </div>
              <span className="sr-only">Загрузка карты и дефектов…</span>
            </div>
          ) : error ? (
            <div className="map-empty-state pointer-events-none absolute left-1/2 top-1/2 z-[500] w-[min(320px,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-destructive/50 bg-destructive/10 p-5 text-center shadow-panel backdrop-blur" role="alert">
              <p className="font-semibold text-destructive">Ошибка загрузки дефектов</p>
              <p className="mt-1 text-[12px] text-muted-foreground">{error}</p>
            </div>
          ) : filteredDefects.length === 0 ? (
            <EmptyState icon={MapPinOff} className="map-empty-state pointer-events-none absolute left-1/2 top-1/2 z-[500] w-[min(340px,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 shadow-panel backdrop-blur" />
          ) : null}

          <MapContainer
            center={SHYMKENT_CENTER}
            zoom={12}
            scrollWheelZoom={true}
            className="z-0 h-full w-full"
            style={{ height: '100%', width: '100%', minHeight: '100%' }}
            zoomControl={false}
            attributionControl={false}
          >
            <MapResizeHandler />
            <ZoomControl position="topleft" />
            <RecenterControl />
            <AddressSearch />

            {activeLayer === 'voyager' && (
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/" target="_blank" rel="noreferrer">CARTO</a>'
                url="https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                subdomains="abcd"
                maxZoom={20}
              />
            )}

            {activeLayer === 'dark' && (
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/" target="_blank" rel="noreferrer">CARTO</a>'
                url="https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
                subdomains="abcd"
                maxZoom={20}
              />
            )}

            {!isLoading && !error && filteredDefects.map((defect) => (
              <DefectMarker key={defect.id} defect={defect} />
            ))}
          </MapContainer>

          {/* Legend */}
          <div className="absolute bottom-3 left-3 z-[500] flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-border bg-card/90 px-3 py-2 backdrop-blur shadow-panel">
            {(["critical", "high", "medium", "low"] as Severity[]).map((s) => (
              <span key={s} className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
                <span className={cn("size-1.5 rounded-full", severityClasses[s].dot)} />
                {severityLabel[s]}
              </span>
            ))}
          </div>

          {/* Marker count */}
          <div className="absolute bottom-3 right-3 z-[500] flex items-center gap-1.5 rounded-lg border border-border bg-card/90 px-2.5 py-1.5 text-[10.5px] text-muted-foreground backdrop-blur shadow-panel">
            <Navigation className="size-3 text-primary" /> {filteredDefects.length} отметок
          </div>
        </div>
      </section>
    </div>
  );
}
