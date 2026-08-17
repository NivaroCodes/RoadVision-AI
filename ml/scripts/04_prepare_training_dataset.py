import os
import sys
import shutil
import random
from collections import defaultdict

def main():
    random.seed(42)
    
    base_dir = os.path.dirname(os.path.dirname(__file__))
    processed_dir = os.path.join(base_dir, "data", "processed")
    training_dir = os.path.join(base_dir, "data", "training")
    
    if not os.path.exists(processed_dir):
        print(f"Error: Processed data directory not found at {processed_dir}")
        sys.exit(1)
        
    # Recreate training directory
    if os.path.exists(training_dir):
        shutil.rmtree(training_dir)
        
    splits = ["train", "val", "test"]
    for split in splits:
        os.makedirs(os.path.join(training_dir, "images", split), exist_ok=True)
        os.makedirs(os.path.join(training_dir, "labels", split), exist_ok=True)
        
    print("Gathering valid image and label pairs...")
    
    # Gather all valid pairs from processed directory
    valid_pairs = []
    
    class_distribution_total = defaultdict(int)
    
    # Processed dir has train, val, test subdirs from previous step
    for existing_split in ["train", "val", "test"]:
        img_dir = os.path.join(processed_dir, existing_split, "images")
        lbl_dir = os.path.join(processed_dir, existing_split, "labels")
        
        if not os.path.exists(img_dir) or not os.path.exists(lbl_dir):
            continue
            
        for img_name in os.listdir(img_dir):
            if not img_name.endswith(".jpg"):
                continue
                
            base_name = os.path.splitext(img_name)[0]
            lbl_name = base_name + ".txt"
            
            img_path = os.path.join(img_dir, img_name)
            lbl_path = os.path.join(lbl_dir, lbl_name)
            
            if not os.path.exists(lbl_path):
                continue
                
            # Check if label is empty or valid
            has_valid_objects = False
            try:
                with open(lbl_path, "r", encoding="utf-8") as f:
                    lines = f.readlines()
                    
                for line in lines:
                    line_str = line.strip()
                    if not line_str:
                        continue
                    parts = line_str.split()
                    if len(parts) == 5:
                        has_valid_objects = True
                        cls_id = int(parts[0])
                        class_distribution_total[cls_id] += 1
            except Exception:
                continue
                
            # We include images even if they have no objects (background images),
            # but since RDD2022 dataset might be huge, we just copy everything valid.
            valid_pairs.append((img_path, lbl_path, img_name, lbl_name))
            
    if not valid_pairs:
        print("Error: No valid images found.")
        sys.exit(1)
        
    print(f"Found {len(valid_pairs)} valid pairs. Shuffling and splitting...")
    
    random.shuffle(valid_pairs)
    
    total = len(valid_pairs)
    train_end = int(total * 0.8)
    val_end = int(total * 0.9)
    
    train_pairs = valid_pairs[:train_end]
    val_pairs = valid_pairs[train_end:val_end]
    test_pairs = valid_pairs[val_end:]
    
    split_mapping = {
        "train": train_pairs,
        "val": val_pairs,
        "test": test_pairs
    }
    
    print(f"Split sizes -> Train: {len(train_pairs)}, Val: {len(val_pairs)}, Test: {len(test_pairs)}")
    
    # Process copying
    split_class_dist = {
        "train": defaultdict(int),
        "val": defaultdict(int),
        "test": defaultdict(int)
    }
    
    for split, pairs in split_mapping.items():
        print(f"Copying {split} data...")
        for img_path, lbl_path, img_name, lbl_name in pairs:
            dest_img = os.path.join(training_dir, "images", split, img_name)
            dest_lbl = os.path.join(training_dir, "labels", split, lbl_name)
            
            shutil.copy2(img_path, dest_img)
            shutil.copy2(lbl_path, dest_lbl)
            
            # Count classes for report
            with open(lbl_path, "r", encoding="utf-8") as f:
                for line in f:
                    line_str = line.strip()
                    if not line_str:
                        continue
                    parts = line_str.split()
                    if len(parts) == 5:
                        cls_id = int(parts[0])
                        split_class_dist[split][cls_id] += 1
                        
    # Generate dataset.yaml
    yaml_path = os.path.join(training_dir, "dataset.yaml")
    with open(yaml_path, "w", encoding="utf-8") as f:
        f.write("path: ../data/training\n")
        f.write("train: images/train\n")
        f.write("val: images/val\n")
        f.write("test: images/test\n\n")
        f.write("names:\n")
        f.write("  0: D00\n")
        f.write("  1: D10\n")
        f.write("  2: D20\n")
        f.write("  3: D40\n")
        
    print(f"dataset.yaml generated at {yaml_path}")
    
    # Generate Report
    report_path = os.path.join(base_dir, "reports", "training_dataset_report.md")
    os.makedirs(os.path.dirname(report_path), exist_ok=True)
    
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("# Training Dataset Preparation Report\n\n")
        
        f.write("## Dataset\n")
        f.write(f"* **Total Images:** {total}\n")
        f.write(f"* **Total Annotations:** {sum(class_distribution_total.values())}\n")
        f.write("* **Total Classes:** 4\n\n")
        
        f.write("## Mapping\n")
        f.write("RDD2022 classes are kept as independent labels for the baseline YOLO training.\n")
        f.write("Semantic mapping to Jol Scan product spec will be handled at the API/Inference level:\n")
        f.write("* D00 (Longitudinal Crack) -> `crack`\n")
        f.write("* D10 (Transverse Crack) -> `crack`\n")
        f.write("* D20 (Alligator Crack) -> `crack`\n")
        f.write("* D40 (Pothole) -> `pothole`\n\n")
        
        f.write("## Split\n")
        f.write(f"* **Train:** {len(train_pairs)} images\n")
        f.write(f"* **Validation:** {len(val_pairs)} images\n")
        f.write(f"* **Test:** {len(test_pairs)} images\n")
        f.write("* **Seed:** 42\n\n")
        
        f.write("### Class Distribution per Split\n")
        f.write("| Class | Train | Validation | Test | Total |\n")
        f.write("|---|---|---|---|---|\n")
        for cls_id, cls_name in [(0, "D00"), (1, "D10"), (2, "D20"), (3, "D40")]:
            c_tr = split_class_dist["train"][cls_id]
            c_va = split_class_dist["val"][cls_id]
            c_te = split_class_dist["test"][cls_id]
            c_tot = class_distribution_total[cls_id]
            f.write(f"| {cls_name} | {c_tr} | {c_va} | {c_te} | {c_tot} |\n")
        f.write("\n")
        
        f.write("## Class Imbalance\n")
        total_obj = sum(class_distribution_total.values())
        if total_obj > 0:
            for cls_id, cls_name in [(0, "D00"), (1, "D10"), (2, "D20"), (3, "D40")]:
                pct = (class_distribution_total[cls_id] / total_obj) * 100
                f.write(f"* {cls_name}: {pct:.1f}%\n")
        f.write("\n*Note: Imbalance is severe (D00 dominates, D40 is rare). Focal loss or class weights should be considered if the baseline underperforms on D40.*\n\n")
        
        f.write("## Output\n")
        f.write(f"* **Dataset Path:** {training_dir}\n")
        f.write(f"* **YAML Path:** {yaml_path}\n")
        f.write(f"* **Status:** READY FOR BASELINE TRAINING\n")
        
    print(f"Report generated at {report_path}")
    print("Dataset preparation completed successfully.")

if __name__ == "__main__":
    main()
