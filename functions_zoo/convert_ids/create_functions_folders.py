import os
import shutil
import glob

fp_data = "/Users/mancchri/Desktop/CIDA_unsorted/Arjun/GenePlexusZoo_webserver/data_zoo/"

for aspecies in ["Human","Mouse","Zebrafish","Fly","Worm","Yeast"]:

    # create directory 
    dir1 = f"convert_ids_{aspecies}"
    if os.path.exists(dir1):
        shutil.rmtree(dir1)
    os.makedirs(dir1)

    # create data dir
    dir2 = f"{dir1}/data"
    if os.path.exists(dir2):
        shutil.rmtree(dir2)
    os.makedirs(dir2)
    # add the ID conversions
    FNs = glob.glob(f"{fp_data}/IDconversion__{aspecies}__*-to-Entrez.json")
    for aFN in FNs:
        fn_end = aFN.strip().split("/")[-1]
        dst = f"{dir2}/{fn_end}"
        shutil.copyfile(aFN, dst)
    # add the node orders
    FNs = glob.glob(f"{fp_data}/NodeOrder__{aspecies}*.txt")
    for aFN in FNs:
        fn_end = aFN.strip().split("/")[-1]
        dst = f"{dir2}/{fn_end}"
        shutil.copyfile(aFN, dst)
    
    # move over the requirements template
    shutil.copyfile("requirements_template.txt", f"{dir1}/requirements.txt")

    # add correct species to the template
    with open("main_template.py", "r") as file:
        file_content = file.read().replace("ADDSPECIES", aspecies)
    with open(f"{dir1}/main.py", "w") as text_file:
        text_file.write(file_content)