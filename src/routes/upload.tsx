import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Crosshair, ImageUp, Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell, PanelHeader } from "@/components/roadvision/DashboardShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "Загрузка дефекта — Qala Vision" },
      {
        name: "description",
        content:
          "Загрузите фотографию дороги для AI-анализа: автоматическое определение дефекта и привязка к координатам.",
      },
      { property: "og:title", content: "Загрузка дефекта — Qala Vision" },
      {
        property: "og:description",
        content: "Отправьте фото дороги на AI-анализ и получите классификацию дефекта.",
      },
    ],
  }),
  component: UploadPage,
});

function UploadPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [lat, setLat] = useState("42.3417");
  const [lng, setLng] = useState("69.5901");
  const [busy, setBusy] = useState(false);

  const accept = (file?: File) => {
    if (!file) return;
    setFileName(file.name);
    setPreview(URL.createObjectURL(file));
  };

  const analyze = () => {
    if (!fileName) {
      toast.error("Сначала выберите фотографию дороги.");
      return;
    }
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      toast.success("Фото отправлено на AI-анализ");
    }, 1100);
  };

  return (
    <DashboardShell
      title="Загрузка дефекта"
      subtitle="Загрузите фотографию дороги для AI-анализа"
    >
      <div className="grid grid-cols-1 gap-4 md:gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <section
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            accept(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            "panel flex min-h-[420px] flex-col items-center justify-center gap-4 border-dashed p-8 text-center transition-colors",
            dragging ? "border-primary bg-primary/[0.05]" : "border-border-strong",
          )}
        >
          {preview ? (
            <img
              src={preview}
              alt={fileName ?? "Загруженное фото дороги"}
              className="max-h-[280px] w-full rounded-lg object-cover"
            />
          ) : (
            <div className="grid size-14 place-items-center rounded-2xl bg-primary/10">
              <UploadCloud className="size-6 text-primary" strokeWidth={1.9} />
            </div>
          )}

          <div>
            <div className="text-[15px] font-semibold text-foreground">
              {fileName ?? "Перетащите фото сюда"}
            </div>
            <p className="mt-1 text-[12.5px] text-muted-foreground">
              или нажмите, чтобы выбрать файл
            </p>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={(e) => accept(e.target.files?.[0])}
          />
          <button
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[12.5px] font-semibold text-primary-foreground shadow-glow transition-opacity hover:opacity-90"
          >
            <ImageUp className="size-4" /> Выбрать файл (JPEG, PNG)
          </button>
        </section>

        <section className="panel h-fit overflow-hidden">
          <PanelHeader title="Местоположение" meta="Координаты точки съёмки" />
          <div className="space-y-4 p-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="lat" className="text-[12px] font-semibold">
                  Широта (Latitude)
                </Label>
                <Input
                  id="lat"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="num h-10 rounded-lg bg-surface/60 text-[13px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lng" className="text-[12px] font-semibold">
                  Долгота (Longitude)
                </Label>
                <Input
                  id="lng"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  className="num h-10 rounded-lg bg-surface/60 text-[13px]"
                />
              </div>
            </div>

            <button
              onClick={() => {
                setLat("42.3417");
                setLng("69.5901");
                toast.success("Местоположение определено");
              }}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface/60 text-[12.5px] font-medium text-foreground transition-colors hover:border-border-strong hover:bg-surface"
            >
              <Crosshair className="size-4 text-primary" /> Определить моё местоположение
            </button>

            <button
              onClick={analyze}
              disabled={busy}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {busy && <Loader2 className="size-4 animate-spin" />}
              {busy ? "Анализ…" : "Загрузить на анализ"}
            </button>

            <p className="text-[11.5px] leading-relaxed text-muted-foreground">
              Модель Qala Vision v4.2 определит тип дефекта, критичность и уверенность
              распознавания, затем добавит запись в журнал дефектов.
            </p>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
