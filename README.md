# Qala Vision (RoadVision AI)
AI-платформа для автоматизированного мониторинга и анализа состояния дорожной инфраструктуры города Шымкент.

## 🚀 Быстрый запуск

### 1. Бэкенд (FastAPI + SQLite)
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt

# Наполнение базы данных тестовыми дефектами Шымкента и пользователями:
python seed_data.py

# Запуск API сервера:
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Фронтенд (React + Vite + Leaflet)
```bash
cd frontend
npm install
npm run dev -- --port 5173
```
Приложение откроется по адресу: **http://localhost:5173**

---

## 🔑 Учётные записи для входа:
* **Администратор**: `admin@qala.vision` / `Password123!`
* **Дорожная служба**: `road@qala.vision` / `Password123!`
* **Житель**: `resident@qala.vision` / `Password123!`

---

## 🌟 Основной функционал:
* 🗺️ **Интерактивная карта OpenStreetMap**: отображение реальных улиц Шымкента, кастомные анимированные локаторы дефектов, фильтрация по периодам (1 день, 7 дней, 30 дней, 12 месяцев).
* 📊 **Аналитический Дашборд**: адаптивный график трендов дефектов (по часам за день, дням недели или месяцам) и сводные карточки показателей (KPI).
* 📑 **Реестр дефектов и экспорт**: детальная таблица дорожных дефектов с фильтрацией и генерацией PDF-отчётов.
* 📷 **Загрузка дефектов**: форма отправки фотографий дорог и координат для AI-анализа.

## 👥 Contributors
- [NivaroCodes](https://github.com/NivaroCodes)
- [leednlk (@evgeniy1969lee-stack)](https://github.com/evgeniy1969lee-stack)

