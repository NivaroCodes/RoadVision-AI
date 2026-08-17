import os
import sys
import subprocess

def run_script(script_name: str) -> bool:
    script_path = os.path.join(os.path.dirname(__file__), script_name)
    print(f"\n{'='*50}")
    print(f"Running {script_name}...")
    print(f"{'='*50}")
    
    result = subprocess.run([sys.executable, script_path])
    
    if result.returncode != 0:
        print(f"\n[ERROR] {script_name} failed with exit code {result.returncode}")
        return False
        
    print(f"[SUCCESS] {script_name} completed.")
    return True

def main():
    scripts = [
        "01_acquire_dataset.py",
        "02_convert_and_validate.py",
        "03_analyze_and_audit.py"
    ]
    
    for script in scripts:
        success = run_script(script)
        if not success:
            print("\nPipeline execution halted due to error.")
            sys.exit(1)
            
    print("\n" + "="*50)
    print("PIPELINE COMPLETED SUCCESSFULLY")
    print("="*50)
    print("Please check the generated dataset_audit.md report.")

if __name__ == "__main__":
    main()
