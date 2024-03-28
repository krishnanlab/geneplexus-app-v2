import json
import pandas as pd
import numpy as np
import os
import shutil

fp_data = "/Users/mancchri/Desktop/CIDA_unsorted/Arjun/GenePlexusZoo_webserver/data_zoo"

# create directory 
dir1 = f"test_genesets"
if os.path.exists(dir1):
    shutil.rmtree(dir1)
os.makedirs(dir1)

gcp_info = []
for aspecies in ["Human","Mouse","Zebrafish","Fly","Worm","Yeast"]:
    
    with open(f"{fp_data}/GSC__{aspecies}__GO__IMP.json", "r") as f:
        gsc = json.load(f)
        
    for akey in gsc["Term_Order"]:
        if (len(gsc[akey]["Genes"]) > 20) and (len(gsc[akey]["Genes"]) < 30):
            genes = gsc[akey]["Genes"]
            num_genes = len(genes)
            term_name = gsc[akey]["Name"]
            gene_str = ",".join(genes)
            gcp_info.append(f"{aspecies}_{akey}_{term_name}_{num_genes}")
            gcp_str = f'curl "https://us-central1-gap-som-dbmi-geneplx-app-p0n.cloudfunctions.net/gpz-convert-ids?geneids={gene_str}&species={aspecies}"'
            gcp_info.append(gcp_str)
            gcp_info.append("")
            np.savetxt(f"{dir1}/geneset_{aspecies}.txt",genes,fmt="%s")
            with open(f"{dir1}/gcp_calls.txt", "w") as thefile:
                for item in gcp_info:
                    thefile.write("%s\n" % item)
            break
