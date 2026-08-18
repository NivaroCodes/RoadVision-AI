import type { DefectMarker } from '@/features/map/types';
import { defectSeverityLabels, defectStatusLabels, defectTypeLabels } from '@/features/defects/labels';
import { format } from 'date-fns';

export interface ReportDataOptions {
  filename: string;
  period: string;
  totals: {
    total_defects: number;
    critical_defects: number;
    in_progress_defects: number;
    fixed_defects: number;
  };
  severityCounts: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  defects: readonly DefectMarker[];
}

export interface GeneratePdfOptions {
  element?: HTMLElement;
  filename: string;
  data?: ReportDataOptions;
}

export async function generatePdf(options: GeneratePdfOptions) {
  const { jsPDF } = await import('jspdf');

  // If data is provided, use the 100% reliable direct Canvas-2D generator
  if (options.data) {
    return generateDirectPdf(options.data, jsPDF);
  }

  // Fallback: if element is provided, try html2canvas with safety fallback
  if (options.element) {
    try {
      const { default: html2canvas } = await import('html2canvas');
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '794px';
      container.style.backgroundColor = '#ffffff';
      container.style.zIndex = '-99999';
      container.style.opacity = '0.001';
      container.style.pointerEvents = 'none';

      const clone = options.element.cloneNode(true) as HTMLElement;
      clone.style.position = 'static';
      clone.style.left = '0';
      clone.style.top = '0';
      clone.style.display = 'block';
      clone.style.visibility = 'visible';
      clone.style.width = '794px';
      clone.style.margin = '0';

      container.appendChild(clone);
      document.body.appendChild(container);

      try {
        const canvas = await html2canvas(clone, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
          logging: false,
          width: 794,
          windowWidth: 794,
        });

        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imageHeight = (canvas.height * pageWidth) / canvas.width;
        const imageData = canvas.toDataURL('image/jpeg', 0.96);

        let offset = 0;
        let remaining = imageHeight;

        pdf.addImage(imageData, 'JPEG', 0, offset, pageWidth, imageHeight);
        while (remaining > pageHeight + 2) {
          remaining -= pageHeight;
          offset -= pageHeight;
          pdf.addPage();
          pdf.addImage(imageData, 'JPEG', 0, offset, pageWidth, imageHeight);
        }
        pdf.save(options.filename);
        return;
      } finally {
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
      }
    } catch (e) {
      console.warn('html2canvas fallback failed, falling back to minimal pdf', e);
    }
  }

  // Basic fallback
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  pdf.setFontSize(18);
  pdf.text('Qala Vision - Отчёт по дефектам', 14, 20);
  pdf.save(options.filename);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

async function generateDirectPdf(data: ReportDataOptions, jsPDFClass: typeof import('jspdf').jsPDF) {
  const canvas = document.createElement('canvas');
  const width = 1200;
  
  // Calculate dynamic height based on number of defect rows
  const headerHeight = 220;
  const cardsHeight = 180;
  const severityHeight = 180;
  const tableHeaderHeight = 60;
  const rowHeight = 44;
  const tableRowsHeight = Math.max(1, data.defects.length) * rowHeight;
  const footerHeight = 100;
  const totalHeight = headerHeight + cardsHeight + severityHeight + tableHeaderHeight + tableRowsHeight + footerHeight;

  canvas.width = width;
  canvas.height = totalHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalHeight);

  // Padding
  const padX = 60;
  let currY = 60;

  // Header Title
  ctx.fillStyle = '#09090b';
  ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Qala Vision', padX, currY + 30);

  ctx.fillStyle = '#71717a';
  ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('AI-мониторинг дорожной инфраструктуры · Шымкент', padX, currY + 60);

  // Header Right (Report Title & Period)
  ctx.textAlign = 'right';
  ctx.fillStyle = '#09090b';
  ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Отчёт по дефектам', width - padX, currY + 30);

  ctx.fillStyle = '#71717a';
  ctx.font = '15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(data.period, width - padX, currY + 58);
  ctx.textAlign = 'left';

  currY += 95;

  // Horizontal divider
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(padX, currY);
  ctx.lineTo(width - padX, currY);
  ctx.stroke();

  currY += 35;

  // 4 Summary KPI Cards
  const cardGap = 20;
  const cardW = (width - 2 * padX - 3 * cardGap) / 4;
  const cardH = 110;

  const summaryItems = [
    { label: 'ВСЕГО', value: data.totals.total_defects, color: '#09090b' },
    { label: 'КРИТИЧЕСКИЕ', value: data.totals.critical_defects, color: '#ef4444' },
    { label: 'В РАБОТЕ', value: data.totals.in_progress_defects, color: '#f59e0b' },
    { label: 'УСТРАНЕНО', value: data.totals.fixed_defects, color: '#10b981' },
  ];

  summaryItems.forEach((item, idx) => {
    const cx = padX + idx * (cardW + cardGap);
    // Card Box
    ctx.fillStyle = '#f8fafc';
    roundRect(ctx, cx, currY, cardW, cardH, 10);
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Card Label
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(item.label, cx + 18, currY + 32);

    // Card Value
    ctx.fillStyle = item.color;
    ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(String(item.value), cx + 18, currY + 80);
  });

  currY += cardH + 45;

  // Severity Distribution Section
  ctx.fillStyle = '#09090b';
  ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Распределение по критичности', padX, currY);

  currY += 25;

  const totalCount = Math.max(1, data.defects.length);
  const severities = [
    { key: 'critical', label: 'Критическая', count: data.severityCounts.critical, color: '#ef4444' },
    { key: 'high', label: 'Высокая', count: data.severityCounts.high, color: '#f97316' },
    { key: 'medium', label: 'Средняя', count: data.severityCounts.medium, color: '#eab308' },
    { key: 'low', label: 'Низкая', count: data.severityCounts.low, color: '#22c55e' },
  ];

  const sevCardW = (width - 2 * padX - 3 * cardGap) / 4;
  severities.forEach((s, idx) => {
    const sx = padX + idx * (sevCardW + cardGap);
    
    // Label & Count
    ctx.fillStyle = '#334155';
    ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(s.label, sx, currY + 20);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(String(s.count), sx + sevCardW, currY + 20);
    ctx.textAlign = 'left';

    // Progress bar bg
    const barY = currY + 30;
    const barH = 10;
    ctx.fillStyle = '#e2e8f0';
    roundRect(ctx, sx, barY, sevCardW, barH, 5);
    ctx.fill();

    // Progress bar fill
    const fillW = Math.max(8, (s.count / totalCount) * sevCardW);
    ctx.fillStyle = s.color;
    roundRect(ctx, sx, barY, fillW, barH, 5);
    ctx.fill();
  });

  currY += 75;

  // Table Section Header
  ctx.fillStyle = '#09090b';
  ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Реестр дефектов', padX, currY);

  currY += 20;

  // Table Header
  const tableW = width - 2 * padX;
  const colX = [
    padX + 15,          // ID
    padX + 95,          // Type
    padX + 310,         // Severity
    padX + 490,         // Status
    padX + 680,         // Address
    width - padX - 20,  // AI Confidence (right aligned)
  ];

  ctx.fillStyle = '#18181b';
  roundRect(ctx, padX, currY, tableW, 40, 6);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('ID', colX[0], currY + 25);
  ctx.fillText('Тип дефекта', colX[1], currY + 25);
  ctx.fillText('Критичность', colX[2], currY + 25);
  ctx.fillText('Статус', colX[3], currY + 25);
  ctx.fillText('Адрес / Улица', colX[4], currY + 25);
  ctx.textAlign = 'right';
  ctx.fillText('Уверенность ИИ', colX[5], currY + 25);
  ctx.textAlign = 'left';

  currY += 40;

  // Table Rows
  data.defects.forEach((defect, idx) => {
    const rowY = currY + idx * rowHeight;

    // Row Background Zebra
    ctx.fillStyle = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
    ctx.fillRect(padX, rowY, tableW, rowHeight);

    // Row bottom border
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padX, rowY + rowHeight);
    ctx.lineTo(padX + tableW, rowY + rowHeight);
    ctx.stroke();

    // ID
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 13px monospace, -apple-system, sans-serif';
    ctx.fillText(`#${defect.id}`, colX[0], rowY + 26);

    // Type
    ctx.fillStyle = '#1e293b';
    ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const typeLabel = defect.type ? (defectTypeLabels[defect.type] || String(defect.type)) : 'Ожидает анализа';
    ctx.fillText(typeLabel, colX[1], rowY + 26);

    // Severity Badge
    const sevLabel = defect.severity ? (defectSeverityLabels[defect.severity] || String(defect.severity)) : '—';
    ctx.fillStyle = defect.severity === 'critical' ? '#ef4444' : defect.severity === 'high' ? '#f97316' : defect.severity === 'medium' ? '#eab308' : '#22c55e';
    ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(sevLabel, colX[2], rowY + 26);

    // Status
    const statusLabel = defectStatusLabels[defect.status] || String(defect.status);
    ctx.fillStyle = '#475569';
    ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(statusLabel, colX[3], rowY + 26);

    // Address (truncated if long)
    const addr = defect.address || 'г. Шымкент';
    ctx.fillStyle = '#334155';
    ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const maxAddrLen = 35;
    const displayAddr = addr.length > maxAddrLen ? addr.substring(0, maxAddrLen) + '…' : addr;
    ctx.fillText(displayAddr, colX[4], rowY + 26);

    // AI Confidence
    ctx.textAlign = 'right';
    ctx.fillStyle = '#09090b';
    ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const conf = defect.confidence !== null && defect.confidence !== undefined ? `${Math.round(defect.confidence * 100)}%` : '—';
    ctx.fillText(conf, colX[5], rowY + 26);
    ctx.textAlign = 'left';
  });

  currY += data.defects.length * rowHeight + 35;

  // Footer
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padX, currY);
  ctx.lineTo(width - padX, currY);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(`Сформировано ${format(new Date(), 'dd.MM.yyyy HH:mm')} · Qala Vision Intelligent Road System`, width / 2, currY + 25);

  // Generate PDF via jsPDF
  const pdf = new jsPDFClass({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgData = canvas.toDataURL('image/jpeg', 0.96);
  const imgHeight = (canvas.height * pageWidth) / canvas.width;

  let offset = 0;
  let remaining = imgHeight;

  pdf.addImage(imgData, 'JPEG', 0, offset, pageWidth, imgHeight);

  while (remaining > pageHeight + 2) {
    remaining -= pageHeight;
    offset -= pageHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, offset, pageWidth, imgHeight);
  }

  pdf.save(data.filename);
}
