import { useState, useRef } from 'react';
import { UploadCloud, MapPin, X, Loader2, CheckCircle2 } from 'lucide-react';
import { apiClient } from '@/api/client';
import { useMutation } from '@tanstack/react-query';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiClient.post('/defects/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      // Clear form on success
      setTimeout(() => {
        setFile(null);
        setPreview(null);
        setLatitude('');
        setLongitude('');
        uploadMutation.reset();
      }, 3000);
    }
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, загрузите изображение (JPEG/PNG).');
      return;
    }
    setFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('Пожалуйста, выберите изображение.');
      return;
    }
    
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || lat < -90 || lat > 90) {
      alert('Некорректная широта (Latitude). Должна быть от -90 до 90.');
      return;
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      alert('Некорректная долгота (Longitude). Должна быть от -180 до 180.');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('latitude', lat.toString());
    formData.append('longitude', lng.toString());

    uploadMutation.mutate(formData);
  };

  // Get current location
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toFixed(6));
          setLongitude(position.coords.longitude.toFixed(6));
        },
        () => {
          alert('Не удалось получить геопозицию. Убедитесь, что вы дали разрешение браузеру.');
        }
      );
    } else {
      alert('Геолокация не поддерживается вашим браузером.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Загрузка дефекта</h1>
        <p className="text-muted-foreground mt-2">
          Загрузите фотографию дороги для AI-анализа.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload Area */}
        <div className="space-y-4">
          <div 
            className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-colors ${
              dragActive ? 'border-primary bg-primary/5' : 'border-border bg-card'
            } ${preview ? 'border-none p-0 overflow-hidden' : ''} aspect-square`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg, image/png"
              onChange={handleChange}
              className="hidden"
            />
            
            {preview ? (
              <div className="relative w-full h-full group">
                <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                  <button 
                    type="button"
                    onClick={() => { setFile(null); setPreview(null); }}
                    className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md font-medium flex items-center gap-2"
                  >
                    <X className="h-4 w-4" /> Удалить фото
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <UploadCloud className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-1">Перетащите фото сюда</h3>
                <p className="text-sm text-muted-foreground mb-4">или нажмите, чтобы выбрать файл</p>
                <button 
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm hover:opacity-90 transition-opacity"
                >
                  Выбрать файл (JPEG, PNG)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Form Area */}
        <div className="space-y-6 bg-card p-6 rounded-xl border shadow-sm h-fit">
          <h3 className="text-lg font-semibold border-b pb-4">Местоположение</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Широта (Latitude)</label>
                <input 
                  type="number" 
                  step="0.000001"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="42.3417"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Долгота (Longitude)</label>
                <input 
                  type="number" 
                  step="0.000001"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="69.5901"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            <button 
              type="button" 
              onClick={handleGetLocation}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              <MapPin className="h-4 w-4" />
              Определить мое местоположение
            </button>
          </div>

          <div className="pt-4">
            {uploadMutation.isSuccess ? (
              <div className="flex w-full items-center justify-center gap-2 rounded-md bg-green-500/10 text-green-500 px-4 py-3 text-sm font-medium border border-green-500/20">
                <CheckCircle2 className="h-5 w-5" />
                Дефект успешно загружен и анализируется!
              </div>
            ) : uploadMutation.isError ? (
              <div className="flex w-full items-center justify-center gap-2 rounded-md bg-destructive/10 text-destructive px-4 py-3 text-sm font-medium border border-destructive/20">
                <X className="h-5 w-5" />
                Ошибка загрузки. Проверьте соединение.
              </div>
            ) : (
              <button 
                type="button" 
                onClick={onUpload}
                disabled={!file || !latitude || !longitude || uploadMutation.isPending}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-3 text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Анализ ИИ...
                  </>
                ) : (
                  'Загрузить на анализ'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
