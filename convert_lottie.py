
import zipfile
import json
import os

source_file = "c:/personal projects/LeafLens/LeafLens-native/assets/animations/walking_pothos.lottie"
target_file = "c:/personal projects/LeafLens/LeafLens-native/assets/animations/walking_pothos.json"

try:
    with zipfile.ZipFile(source_file, 'r') as z:
        print("Files in zip:", z.namelist())
        
        # Check for manifest
        if "manifest.json" in z.namelist():
            with z.open("manifest.json") as f:
                manifest = json.load(f)
                print("Manifest:", manifest)
                
                if "animations" in manifest and len(manifest["animations"]) > 0:
                    first_anim_id = manifest["animations"][0]["id"]
                    anim_path = f"animations/{first_anim_id}.json"
                    
                    if anim_path in z.namelist():
                        print(f"Extracting {anim_path} to {target_file}")
                        with z.open(anim_path) as source, open(target_file, "wb") as target:
                            target.write(source.read())
                        print("Success!")
                    else:
                        print(f"Animation file {anim_path} not found in zip")
                else:
                    print("No animations found in manifest")
        else:
            # Fallback for simple structure or other formats
            json_files = [f for f in z.namelist() if f.endswith(".json") and "manifest" not in f]
            if json_files:
                print(f"Extracting first json found: {json_files[0]}")
                with z.open(json_files[0]) as source, open(target_file, "wb") as target:
                    target.write(source.read())
            else:
                print("No JSON files found in zip")

except Exception as e:
    print(f"Error: {e}")
