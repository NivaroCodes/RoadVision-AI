import os
from PIL import Image
import xml.etree.ElementTree as ET

def create_mock_xml(filepath: str, filename: str, w: int, h: int, objects: list):
    annotation = ET.Element("annotation")
    
    folder = ET.SubElement(annotation, "folder")
    folder.text = "train"
    
    fname = ET.SubElement(annotation, "filename")
    fname.text = filename
    
    size = ET.SubElement(annotation, "size")
    width = ET.SubElement(size, "width")
    width.text = str(w)
    height = ET.SubElement(size, "height")
    height.text = str(h)
    depth = ET.SubElement(size, "depth")
    depth.text = "3"
    
    for obj in objects:
        obj_el = ET.SubElement(annotation, "object")
        name = ET.SubElement(obj_el, "name")
        name.text = obj["name"]
        
        bndbox = ET.SubElement(obj_el, "bndbox")
        xmin = ET.SubElement(bndbox, "xmin")
        xmin.text = str(obj["xmin"])
        ymin = ET.SubElement(bndbox, "ymin")
        ymin.text = str(obj["ymin"])
        xmax = ET.SubElement(bndbox, "xmax")
        xmax.text = str(obj["xmax"])
        ymax = ET.SubElement(bndbox, "ymax")
        ymax.text = str(obj["ymax"])
        
    tree = ET.ElementTree(annotation)
    tree.write(filepath, encoding="utf-8", xml_declaration=True)

def main():
    base_dir = os.path.dirname(os.path.dirname(__file__))
    raw_dir = os.path.join(base_dir, "data", "raw", "MockCountry", "train")
    img_dir = os.path.join(raw_dir, "images")
    xml_dir = os.path.join(raw_dir, "annotations", "xmls")
    
    os.makedirs(img_dir, exist_ok=True)
    os.makedirs(xml_dir, exist_ok=True)
    
    # Image 1: Contains D00 and D40
    img1_path = os.path.join(img_dir, "img1.jpg")
    img1 = Image.new('RGB', (640, 640), color = 'gray')
    img1.save(img1_path)
    
    xml1_path = os.path.join(xml_dir, "img1.xml")
    create_mock_xml(xml1_path, "img1.jpg", 640, 640, [
        {"name": "D00", "xmin": 100, "ymin": 100, "xmax": 200, "ymax": 200},
        {"name": "D40", "xmin": 300, "ymin": 300, "xmax": 400, "ymax": 400}
    ])
    
    # Image 2: Contains D10 and D20
    img2_path = os.path.join(img_dir, "img2.jpg")
    img2 = Image.new('RGB', (720, 480), color = 'darkgray')
    img2.save(img2_path)
    
    xml2_path = os.path.join(xml_dir, "img2.xml")
    create_mock_xml(xml2_path, "img2.jpg", 720, 480, [
        {"name": "D10", "xmin": 50, "ymin": 50, "xmax": 150, "ymax": 150},
        {"name": "D20", "xmin": 250, "ymin": 250, "xmax": 350, "ymax": 350}
    ])
    
    print("Mock dataset created successfully.")

if __name__ == "__main__":
    main()
