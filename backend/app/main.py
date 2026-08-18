import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.api.router import api_router
from app.core.db import engine, Base
import app.models  # noqa: F401

# Auto-initialize and seed DB on startup
def init_db():
    Base.metadata.create_all(bind=engine)
    from app.core.db import SessionLocal
    from app.models.user import User, UserRole
    from app.models.defect import Defect, DefectReport, DefectType, DefectSeverity, DefectStatus, PriorityLevel, AnalysisStatus, VerificationStatus
    import bcrypt
    from datetime import datetime, timezone, timedelta
    import random

    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            def get_hash(pw: str) -> str:
                return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()
            
            pw_hash = get_hash('Password123!')
            users = [
                ('admin@qala.vision', pw_hash, UserRole.admin, True),
                ('road@qala.vision', pw_hash, UserRole.road_service, True),
                ('resident@qala.vision', pw_hash, UserRole.resident, True),
            ]
            for email, h, role, active in users:
                db.add(User(email=email, hashed_password=h, role=role, is_active=active))
            db.commit()

            admin_user = db.query(User).filter(User.email == 'admin@qala.vision').first()
            admin_id = admin_user.id if admin_user else 1

            shymkent_locations = [
                ('пр. Тауке хана, 15', 42.3180, 69.5930, DefectType.POTHOLE, DefectSeverity.CRITICAL),
                ('пр. Тауке хана, 88', 42.3210, 69.6050, DefectType.CRACK, DefectSeverity.MEDIUM),
                ('пр. Тауке хана, 140', 42.3230, 69.6180, DefectType.NET, DefectSeverity.HIGH),
                ('пр. Кунаева, 21', 42.3245, 69.5870, DefectType.DAMAGED_MANHOLE, DefectSeverity.HIGH),
                ('пр. Кунаева, 88', 42.3330, 69.5880, DefectType.POTHOLE, DefectSeverity.MEDIUM),
                ('пр. Кунаева, 110', 42.3410, 69.5895, DefectType.ROAD_COLLAPSE, DefectSeverity.CRITICAL),
                ('ул. Байтурсынова, 12', 42.3250, 69.5910, DefectType.CRACK, DefectSeverity.LOW),
                ('ул. Байтурсынова, 45', 42.3300, 69.5920, DefectType.POTHOLE, DefectSeverity.HIGH),
                ('ул. Рыскулова, 54', 42.3460, 69.6010, DefectType.NET, DefectSeverity.MEDIUM),
                ('ул. Рыскулова, 104', 42.3520, 69.6100, DefectType.ROAD_COLLAPSE, DefectSeverity.CRITICAL),
                ('ул. Желтоксан, 18', 42.3150, 69.5860, DefectType.DAMAGED_MANHOLE, DefectSeverity.MEDIUM),
                ('ул. Желтоксан, 42', 42.3220, 69.5880, DefectType.POTHOLE, DefectSeverity.HIGH),
                ('пр. Республики, 18', 42.3210, 69.5760, DefectType.CRACK, DefectSeverity.LOW),
                ('пр. Республики, 34', 42.3260, 69.5780, DefectType.POTHOLE, DefectSeverity.CRITICAL),
                ('пр. Абая, 55', 42.3120, 69.6120, DefectType.NET, DefectSeverity.MEDIUM),
                ('пр. Абая, 92', 42.3200, 69.6150, DefectType.POTHOLE, DefectSeverity.HIGH),
                ('ул. Жибек Жолы, 78', 42.3320, 69.6250, DefectType.ROAD_COLLAPSE, DefectSeverity.CRITICAL),
                ('ул. Жибек Жолы, 102', 42.3380, 69.6300, DefectType.CRACK, DefectSeverity.LOW),
                ('ул. Иляева, 33', 42.3215, 69.5980, DefectType.DAMAGED_MANHOLE, DefectSeverity.MEDIUM),
                ('ул. Иляева, 56', 42.3240, 69.6030, DefectType.POTHOLE, DefectSeverity.HIGH),
                ('ул. Казыбек би, 15', 42.3140, 69.5890, DefectType.CRACK, DefectSeverity.LOW),
                ('ул. Казыбек би, 40', 42.3160, 69.5910, DefectType.POTHOLE, DefectSeverity.MEDIUM),
                ('ул. Туркестанская, 24', 42.3170, 69.5970, DefectType.NET, DefectSeverity.HIGH),
                ('ул. Туркестанская, 64', 42.3195, 69.6020, DefectType.ROAD_COLLAPSE, DefectSeverity.CRITICAL),
                ('ул. Дулати, 28', 42.3135, 69.5890, DefectType.DAMAGED_MANHOLE, DefectSeverity.HIGH),
                ('ул. Дулати, 67', 42.3190, 69.5915, DefectType.POTHOLE, DefectSeverity.MEDIUM),
                ('ул. Аскарова, 23', 42.3240, 69.5980, DefectType.CRACK, DefectSeverity.LOW),
                ('ул. Аскарова, 50', 42.3280, 69.6010, DefectType.POTHOLE, DefectSeverity.CRITICAL),
                ('ул. Гагарина, 12', 42.3080, 69.5820, DefectType.NET, DefectSeverity.MEDIUM),
                ('ул. Толе би, 83', 42.3140, 69.5960, DefectType.POTHOLE, DefectSeverity.HIGH),
                ('пр. Аль-Фараби, 22', 42.3050, 69.6000, DefectType.ROAD_COLLAPSE, DefectSeverity.CRITICAL),
                ('ул. Сайрамская, 34', 42.3290, 69.6110, DefectType.CRACK, DefectSeverity.LOW),
                ('ул. Момышулы, 15', 42.3270, 69.5830, DefectType.DAMAGED_MANHOLE, DefectSeverity.HIGH),
                ('ул. Утепова, 9', 42.3450, 69.6020, DefectType.POTHOLE, DefectSeverity.MEDIUM),
                ('пр. Назарбаева, 45', 42.3390, 69.5950, DefectType.NET, DefectSeverity.HIGH),
            ]
            statuses = [DefectStatus.SUBMITTED, DefectStatus.DETECTED, DefectStatus.IN_PROGRESS, DefectStatus.FIXED, DefectStatus.VERIFIED]
            now = datetime.now(timezone.utc)

            for idx, (addr, lat, lng, d_type, sev) in enumerate(shymkent_locations, start=1):
                stat = random.choices(statuses, weights=[0.2, 0.25, 0.25, 0.2, 0.1])[0]
                prio = PriorityLevel(sev.value)
                conf = round(random.uniform(0.85, 0.99), 2)
                
                if idx <= 10:
                    days_ago = 0
                elif idx <= 20:
                    days_ago = random.randint(1, 6)
                elif idx <= 30:
                    days_ago = random.randint(7, 29)
                else:
                    days_ago = random.randint(30, 360)
                    
                created = now - timedelta(days=days_ago, hours=random.randint(0, 23), minutes=random.randint(0, 59))
                img_url = '/uploads/sample_defect.jpg'
                
                d = Defect(
                    type=d_type,
                    status=stat,
                    severity=sev,
                    latitude=lat,
                    longitude=lng,
                    address=addr,
                    confidence=conf,
                    image_url=img_url,
                    owner_id=admin_id,
                    confirmation_count=random.randint(1, 5),
                    priority=prio,
                    priority_reasons=['Главная магистраль', 'Высокая интенсивность движения'],
                    analysis_status=AnalysisStatus.COMPLETED,
                    verification_status=VerificationStatus.VERIFIED if stat == DefectStatus.VERIFIED else VerificationStatus.PENDING,
                    created_at=created,
                    updated_at=created,
                )
                db.add(d)
                db.flush()

                rep = DefectReport(
                    defect_id=d.id,
                    resident_id=admin_id,
                    image_url=img_url,
                    latitude=lat,
                    longitude=lng,
                    created_at=created,
                    updated_at=created,
                )
                db.add(rep)
            db.commit()
    finally:
        db.close()

init_db()

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.get("/")
async def root():
    return {"message": "Welcome to Qala Vision API"}
