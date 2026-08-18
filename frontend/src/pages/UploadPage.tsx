import { useState, useRef } from 'react';
import { Crosshair, ImageUp, Loader2, UploadCloud, CheckCircle2, X } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PanelHeader } from '@/components/layout/PanelHeader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function UploadPage() {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [lat, setLat] = useState('42.3417');
  const [lng, setLng] = useState('69.5901');

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiClient.post('/defects/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Фото отправлено на AI-анализ');
      queryClient.invalidateQueries({ queryKey: ['my-defects'] });
      queryClient.invalidateQueries({ queryKey: ['defects'] });
      queryClient.invalidateQueries({ queryKey: ['map-defects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      setTimeout(() => {
        setFile(null);
        setFileName(null);
        setPreview(null);
        uploadMutation.reset();
      }, 3000);
    },
    onError: () => {
      toast.error('Ошибка загрузки. Проверьте соединение с сервером.');
    },
  });

  const accept = (selectedFile?: File) => {
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Пожалуйста, выберите изображение (JPEG, PNG).');
      return;
    }
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Сначала выберите фотографию дороги.');
      return;
    }

    const latitudeNum = parseFloat(lat);
    const longitudeNum = parseFloat(lng);

    if (isNaN(latitudeNum) || latitudeNum < -90 || latitudeNum > 90) {
      toast.error('Некорректная широта (Latitude). Должна быть от -90 до 90.');
      return;
    }
    if (isNaN(longitudeNum) || longitudeNum < -180 || longitudeNum > 180) {
      toast.error('Некорректная долгота (Longitude). Должна быть от -180 до 180.');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('latitude', latitudeNum.toString());
    formData.append('longitude', longitudeNum.toString());

    uploadMutation.mutate(formData);
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude.toFixed(6));
          setLng(position.coords.longitude.toFixed(6));
          toast.success('Местоположение определено');
        },
        () => {
          setLat('42.3417');
          setLng('69.5901');
          toast.info('Установлены координаты центра Шымкента');
        }
      );
    } else {
      setLat('42.3417');
      setLng('69.5901');
      toast.info('Установлены координаты центра Шымкента');
    }
  };

  return (
    <div className="space-y-4 md:space-y-5">
      <div className="grid grid-cols-1 gap-4 md:gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        {/* Drag & Drop Panel */}
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
            dragging ? "border-primary bg-primary/[0.05]" : "border-border-strong"
          )}
        >
          {preview ? (
            <div className="relative w-full">
              <img
                src={preview}
                alt={fileName ?? "Загруженное фото дороги"}
                className="max-h-[280px] w-full rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setFileName(null);
                  setPreview(null);
                }}
                className="absolute right-2 top-2 rounded-md bg-background/80 p-1.5 text-muted-foreground backdrop-blur hover:text-foreground"
                aria-label="Удалить фото"
              >
                <X className="size-4" />
              </button>
            </div>
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
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[12.5px] font-semibold text-primary-foreground shadow-glow transition-opacity hover:opacity-90 cursor-pointer"
          >
            <ImageUp className="size-4" /> Выбрать файл (JPEG, PNG)
          </button>
        </section>

        {/* Location & Action Panel */}
        <section className="panel h-fit overflow-hidden">
          <PanelHeader title="Местоположение" meta="Координаты точки съёмки" />
          <form onSubmit={handleAnalyze} className="space-y-4 p-5">
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
              type="button"
              onClick={handleGetLocation}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface/60 text-[12.5px] font-medium text-foreground transition-colors hover:border-border-strong hover:bg-surface cursor-pointer"
            >
              <Crosshair className="size-4 text-primary" /> Определить моё местоположение
            </button>

            {uploadMutation.isSuccess ? (
              <div className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary/10 text-primary border border-primary/30 py-3 text-[13px] font-semibold">
                <CheckCircle2 className="size-4" />
                Дефект успешно загружен и отправлен на анализ!
              </div>
            ) : (
              <button
                type="submit"
                disabled={!file || uploadMutation.isPending}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-[13px] font-semibold text-primary-foreground shadow-glow transition-opacity hover:opacity-90 disabled:opacity-60 cursor-pointer"
              >
                {uploadMutation.isPending && <Loader2 className="size-4 animate-spin" />}
                {uploadMutation.isPending ? "Анализ…" : "Загрузить на анализ"}
              </button>
            )}

            <p className="text-[11.5px] leading-relaxed text-muted-foreground">
              Модель Qala Vision v4.2 определит тип дефекта, критичность и уверенность
              распознавания, затем добавит запись в журнал дефектов.
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
