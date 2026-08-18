import io
import logging
from PIL import Image
from app.schemas.ml_schemas import DetectionResult

try:
    from ultralytics import YOLO
    HAS_YOLO = True
except ImportError:
    HAS_YOLO = False

logger = logging.getLogger(__name__)

class DetectionService:
    def __init__(self):
        # Baseline model loading. 
        # Future injection point for fine-tuned RDD2022 weights.
        self.model = None
        if HAS_YOLO:
            try:
                # Load a pretrained baseline YOLOv8 model for inference demonstration
                self.model = YOLO("yolov8n.pt")
                logger.info("Loaded baseline YOLOv8n model.")
            except Exception as e:
                logger.warning(f"Could not load YOLO model: {e}")

    def analyze(self, image_bytes: bytes) -> DetectionResult:
        if not self.model:
            # Fallback heuristic if ML package is missing weights completely
            return DetectionResult(
                detected=False,
                confidence=0.0
            )

        try:
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            results = self.model(image, verbose=False)

            if not results or len(results[0].boxes) == 0:
                return DetectionResult(detected=False, confidence=0.0)

            # Get the highest confidence bounding box
            boxes = results[0].boxes
            best_idx = boxes.conf.argmax().item()
            best_conf = boxes.conf[best_idx].item()
            class_id = int(boxes.cls[best_idx].item())

            # Semantic mapping from generic classes to Qala Vision spec
            # In a real model, class_id would correspond exactly to RDD2022 (D00, D10, D20, D40)
            # Here we fake a mapping for the baseline YOLO to prove the pipeline works.
            # E.g., if YOLO detects a car/bus/truck, we just fallback, but if it detects something, we treat it as an example.

            # Since YOLOv8n doesn't have "pothole", we simulate the detection output 
            # for integration purposes based on confidence.
            # REPLACE this mapping once `best.pt` (RDD2022 trained model) is available.
            defect_type = "pothole" if class_id % 2 == 0 else "crack"

            # Map confidence to severity (heuristic baseline)
            if best_conf > 0.8:
                severity = "high"
            elif best_conf > 0.6:
                severity = "medium"
            else:
                severity = "low"

            return DetectionResult(
                detected=True,
                defect_type=defect_type,
                severity=severity,
                confidence=float(best_conf)
            )
        except Exception as e:
            logger.error(f"Detection error: {e}")
            return DetectionResult(detected=False, confidence=0.0)
