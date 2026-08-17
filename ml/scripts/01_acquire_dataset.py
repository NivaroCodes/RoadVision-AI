import os
import sys

def main():
    raw_data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "raw")
    
    if not os.path.exists(raw_data_dir):
        os.makedirs(raw_data_dir)
        
    xml_files = []
    for root, _, files in os.walk(raw_data_dir):
        for f in files:
            if f.endswith(".xml"):
                xml_files.append(os.path.join(root, f))
                
    if len(xml_files) == 0:
        print("Dataset not found locally.")
        print("\n--- INSTRUCTIONS FOR ACQUIRING RDD2022 DATASET ---")
        print("Please download the official RDD2022 dataset from Figshare:")
        print("Link: https://figshare.com/articles/dataset/RDD2022/21431547")
        print("\nAlternatively, you can use the Kaggle mirror if Figshare is unavailable:")
        print("https://www.kaggle.com/datasets/alaagaberh/rdd2022")
        print("\nOnce downloaded, extract the dataset into the 'ml/data/raw/' directory.")
        print("The structure should roughly contain country folders, e.g., 'Czech/train/images/', etc.")
        print("We need both '.jpg' and '.xml' annotations.")
        print("---------------------------------------------------\n")
        sys.exit(1)
        
    print(f"Found {len(xml_files)} annotation files in {raw_data_dir}.")
    print("Dataset acquisition step passed.")

if __name__ == "__main__":
    main()
