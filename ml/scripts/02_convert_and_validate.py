import os
import sys
import shutil
import xml.etree.ElementTree as ET
from pathlib import Path

# Class mapping based on requirements
CLASS_MAPPING = {
    "D00": 0,
    "D10": 1,
    "D20": 2,
    "D40": 3
}

def parse_xml_to_yolo(xml_path: str, img_width: int, img_height: int) -> list[str]:
    """Parses PASCAL VOC XML and returns a list of YOLO formatted strings."""
    tree = ET.parse(xml_path)
    root = tree.getroot()
    
    yolo_lines = []
    
    for obj in root.findall("object"):
        name = obj.find("name")
        if name is None:
            continue
            
        cls_name = name.text
        if cls_name not in CLASS_MAPPING:
            continue
            
        cls_id = CLASS_MAPPING[cls_name]
        
        bndbox = obj.find("bndbox")
        if bndbox is None:
            continue
            
        xmin = float(bndbox.find("xmin").text)
        ymin = float(bndbox.find("ymin").text)
        xmax = float(bndbox.find("xmax").text)
        ymax = float(bndbox.find("ymax").text)
        
        # Validation checks
        if xmin < 0 or ymin < 0 or xmax > img_width or ymax > img_height:
            raise ValueError(f"Bounding box out of bounds in {xml_path}")
            
        if xmin >= xmax or ymin >= ymax:
            raise ValueError(f"Invalid bounding box dimensions in {xml_path}")
            
        # Convert to YOLO format (center_x, center_y, width, height) normalized
        box_w = xmax - xmin
        box_h = ymax - ymin
        x_center = xmin + (box_w / 2)
        y_center = ymin + (box_h / 2)
        
        norm_x_center = x_center / img_width
        norm_y_center = y_center / img_height
        norm_w = box_w / img_width
        norm_h = box_h / img_height
        
        yolo_lines.append(f"{cls_id} {norm_x_center:.6f} {norm_y_center:.6f} {norm_w:.6f} {norm_h:.6f}")
        
    return yolo_lines

def determine_split(file_path: str) -> str:
    """Determine if a file belongs to train, val, or test based on its path."""
    path_lower = file_path.lower()
    if "/val/" in path_lower or "\\val\\" in path_lower:
        return "val"
    elif "/test/" in path_lower or "\\test\\" in path_lower:
        return "test"
    else:
        # Default to train if it's explicitly in a train folder, or just default to train
        return "train"

def main():
    base_dir = os.path.dirname(os.path.dirname(__file__))
    raw_dir = os.path.join(base_dir, "data", "raw")
    processed_dir = os.path.join(base_dir, "data", "processed")
    
    if not os.path.exists(raw_dir):
        print("Error: Raw data directory not found.")
        sys.exit(1)
        
    # Recreate processed directory
    if os.path.exists(processed_dir):
        shutil.rmtree(processed_dir)
        
    for split in ["train", "val", "test"]:
        os.makedirs(os.path.join(processed_dir, split, "images"), exist_ok=True)
        os.makedirs(os.path.join(processed_dir, split, "labels"), exist_ok=True)
        
    processed_count = 0
    errors_count = 0
    
    for root, _, files in os.walk(raw_dir):
        for f in files:
            if f.endswith(".xml"):
                xml_path = os.path.join(root, f)
                
                # Check for matching JPG
                base_name = os.path.splitext(f)[0]
                img_path = os.path.join(root, base_name + ".jpg")
                
                # Sometimes images are in an 'images' folder alongside 'annotations'
                if not os.path.exists(img_path):
                    # Try looking in 'images' sibling folder
                    parent_dir = os.path.dirname(root)
                    if os.path.basename(root) in ["xmls", "annotations"]:
                        alt_img_path = os.path.join(parent_dir, "images", base_name + ".jpg")
                        if not os.path.exists(alt_img_path):
                            # Try one level higher (e.g. annotations/xmls -> parent -> images)
                            higher_parent = os.path.dirname(parent_dir)
                            alt_img_path = os.path.join(higher_parent, "images", base_name + ".jpg")
                        img_path = alt_img_path
                
                if not os.path.exists(img_path):
                    print(f"Warning: Image not found for {xml_path}")
                    errors_count += 1
                    continue
                    
                # Read image size from XML
                try:
                    tree = ET.parse(xml_path)
                    xml_root = tree.getroot()
                    size_node = xml_root.find("size")
                    if size_node is None:
                        raise ValueError("No size node in XML")
                    
                    img_width = int(size_node.find("width").text)
                    img_height = int(size_node.find("height").text)
                    
                    if img_width <= 0 or img_height <= 0:
                        raise ValueError("Invalid image dimensions in XML")
                        
                    yolo_lines = parse_xml_to_yolo(xml_path, img_width, img_height)
                    
                    split = determine_split(xml_path)
                    
                    dest_img_path = os.path.join(processed_dir, split, "images", base_name + ".jpg")
                    dest_label_path = os.path.join(processed_dir, split, "labels", base_name + ".txt")
                    
                    shutil.copy2(img_path, dest_img_path)
                    with open(dest_label_path, "w", encoding="utf-8") as out_f:
                        out_f.write("\n".join(yolo_lines) + "\n")
                        
                    processed_count += 1
                    
                except Exception as e:
                    print(f"Error processing {xml_path}: {e}")
                    errors_count += 1
                    
    print(f"\nConversion finished.")
    print(f"Successfully processed: {processed_count}")
    print(f"Errors/Warnings: {errors_count}")

if __name__ == "__main__":
    main()
