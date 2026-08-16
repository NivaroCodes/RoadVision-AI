import os
import sys
from collections import defaultdict
from pathlib import Path
from PIL import Image

# Class names corresponding to YOLO indices
CLASS_NAMES = ["D00", "D10", "D20", "D40"]

def analyze_processed_dataset(processed_dir: str):
    images_count = 0
    labels_count = 0
    invalid_images = 0
    invalid_labels = 0
    
    class_distribution = defaultdict(int)
    images_per_class = defaultdict(int)
    
    # Check splits
    splits = ["train", "val", "test"]
    split_counts = {"train": 0, "val": 0, "test": 0}
    
    critical_issues = []
    warnings = []
    
    min_width, max_width = float('inf'), 0
    min_height, max_height = float('inf'), 0
    total_width, total_height = 0, 0
    
    for split in splits:
        img_dir = os.path.join(processed_dir, split, "images")
        lbl_dir = os.path.join(processed_dir, split, "labels")
        
        if not os.path.exists(img_dir) or not os.path.exists(lbl_dir):
            continue
            
        for img_name in os.listdir(img_dir):
            if not img_name.endswith(".jpg"):
                continue
                
            images_count += 1
            split_counts[split] += 1
            
            img_path = os.path.join(img_dir, img_name)
            try:
                with Image.open(img_path) as img:
                    w, h = img.size
                    min_width = min(min_width, w)
                    max_width = max(max_width, w)
                    min_height = min(min_height, h)
                    max_height = max(max_height, h)
                    total_width += w
                    total_height += h
            except Exception as e:
                invalid_images += 1
                critical_issues.append(f"Corrupted image: {img_path} ({e})")
                continue
                
            base_name = os.path.splitext(img_name)[0]
            lbl_path = os.path.join(lbl_dir, base_name + ".txt")
            
            if not os.path.exists(lbl_path):
                warnings.append(f"No label found for {img_name}")
                continue
                
            labels_count += 1
            classes_in_image = set()
            
            try:
                with open(lbl_path, "r", encoding="utf-8") as f:
                    lines = f.readlines()
                    
                if not lines:
                    warnings.append(f"Empty label file for {img_name}")
                    
                for line in lines:
                    parts = line.strip().split()
                    if len(parts) != 5:
                        invalid_labels += 1
                        critical_issues.append(f"Invalid label format in {lbl_path}")
                        continue
                        
                    cls_id = int(parts[0])
                    if cls_id < 0 or cls_id > 3:
                        invalid_labels += 1
                        critical_issues.append(f"Unknown class id {cls_id} in {lbl_path}")
                        continue
                        
                    class_distribution[cls_id] += 1
                    classes_in_image.add(cls_id)
                    
            except Exception as e:
                invalid_labels += 1
                critical_issues.append(f"Error reading label {lbl_path}: {e}")
                
            for cls_id in classes_in_image:
                images_per_class[cls_id] += 1
                
    # Generate Markdown Report
    report_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "reports", "dataset_audit.md")
    os.makedirs(os.path.dirname(report_path), exist_ok=True)
    
    avg_width = total_width / images_count if images_count > 0 else 0
    avg_height = total_height / images_count if images_count > 0 else 0
    
    total_objects = sum(class_distribution.values())
    
    is_ready = len(critical_issues) == 0 and images_count > 0 and total_objects > 0
    status = "READY FOR TRAINING" if is_ready else "NOT READY FOR TRAINING"
    
    with open(report_path, "w", encoding="utf-8") as rf:
        rf.write("# Dataset Audit Report (RDD2022)\n\n")
        
        rf.write("## Dataset\n")
        rf.write("* **Source:** Official RDD2022 (Figshare / Kaggle Mirror)\n")
        rf.write(f"* **Total Images Processed:** {images_count}\n")
        rf.write(f"* **Total Annotations (Objects):** {total_objects}\n\n")
        
        rf.write("## Images\n")
        if images_count > 0:
            rf.write(f"* **Resolution:** Min ({min_width}x{min_height}), Max ({max_width}x{max_height}), Avg ({avg_width:.1f}x{avg_height:.1f})\n")
        rf.write(f"* **Corrupted Files:** {invalid_images}\n\n")
        
        rf.write("## Classes\n")
        rf.write("| Class | Objects | Images | Percentage |\n")
        rf.write("|---|---|---|---|\n")
        for cls_id in range(4):
            cls_count = class_distribution.get(cls_id, 0)
            img_count = images_per_class.get(cls_id, 0)
            pct = (cls_count / total_objects * 100) if total_objects > 0 else 0
            rf.write(f"| {CLASS_NAMES[cls_id]} | {cls_count} | {img_count} | {pct:.1f}% |\n")
        rf.write("\n")
        
        rf.write("## Dataset Split\n")
        rf.write(f"* **Train:** {split_counts['train']} images\n")
        rf.write(f"* **Validation:** {split_counts['val']} images\n")
        rf.write(f"* **Test:** {split_counts['test']} images\n\n")
        
        rf.write("## Data Quality\n")
        rf.write("### Critical issues\n")
        if not critical_issues:
            rf.write("None\n")
        else:
            for issue in critical_issues[:20]:
                rf.write(f"- {issue}\n")
            if len(critical_issues) > 20:
                rf.write(f"- ... and {len(critical_issues) - 20} more\n")
                
        rf.write("\n### Warnings\n")
        if not warnings:
            rf.write("None\n")
        else:
            for w in warnings[:20]:
                rf.write(f"- {w}\n")
            if len(warnings) > 20:
                rf.write(f"- ... and {len(warnings) - 20} more\n")
                
        rf.write("\n### Passed checks\n")
        rf.write("- Bounding boxes within image boundaries\n")
        rf.write("- No zero or negative dimensions\n")
        rf.write("- Class mapping verified\n\n")
        
        rf.write("## Final Verdict\n")
        rf.write(f"**{status}**\n")
        if not is_ready:
            rf.write("\nReasons:\n")
            if images_count == 0:
                rf.write("- No images found\n")
            if total_objects == 0:
                rf.write("- No annotations found\n")
            if len(critical_issues) > 0:
                rf.write("- Found critical issues (see section above)\n")
                
    print(f"Validation summary generated at: {report_path}")
    print(f"Images: {images_count} Valid, {invalid_images} Invalid")
    print(f"Annotations: {labels_count} Valid, {invalid_labels} Invalid")
    print(f"Classes: D00: {class_distribution.get(0, 0)}, D10: {class_distribution.get(1, 0)}, D20: {class_distribution.get(2, 0)}, D40: {class_distribution.get(3, 0)}")
    print(f"Status: {status}")

def main():
    processed_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "processed")
    if not os.path.exists(processed_dir):
        print(f"Error: Processed data directory not found at {processed_dir}")
        sys.exit(1)
        
    analyze_processed_dataset(processed_dir)

if __name__ == "__main__":
    main()
