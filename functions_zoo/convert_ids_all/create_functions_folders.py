import os
import shutil
import glob

fp_data = "/Users/mancchri/Desktop/CIDA_unsorted/Arjun/GenePlexusZoo_webserver/data_zoo/"

# create directory 
dir1 = f"convert_ids"
if os.path.exists(dir1):
    shutil.rmtree(dir1)
os.makedirs(dir1)

# create data dir
dir2 = f"{dir1}/data"
if os.path.exists(dir2):
    shutil.rmtree(dir2)
os.makedirs(dir2)
# add the ID conversions
FNs = glob.glob(f"{fp_data}/IDconversion*-to-Entrez.json")
for aFN in FNs:
    fn_end = aFN.strip().split("/")[-1]
    dst = f"{dir2}/{fn_end}"
    shutil.copyfile(aFN, dst)
# add the node orders
FNs = glob.glob(f"{fp_data}/NodeOrder*.txt")
for aFN in FNs:
    fn_end = aFN.strip().split("/")[-1]
    dst = f"{dir2}/{fn_end}"
    shutil.copyfile(aFN, dst)

# move over the requirements template
shutil.copyfile("requirements_template.txt", f"{dir1}/requirements.txt")

# move over the main template
shutil.copyfile("main_template.py", f"{dir1}/main.py")