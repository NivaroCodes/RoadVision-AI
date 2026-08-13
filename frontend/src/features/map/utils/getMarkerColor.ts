import type { DefectSeverity } from '../types';

const MARKER_COLORS: Record<DefectSeverity, string> = {
  high: '#ef4444',
  medium: '#f97316',
  low: '#22c55e',
};

export function getMarkerColor(severity: DefectSeverity): string {
  return MARKER_COLORS[severity];
}
