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
for sp_trn in ["Human","Mouse","Zebrafish","Fly","Worm","Yeast"]:
    
    with open(f"{fp_data}/GSC__{sp_trn}__GO__IMP.json", "r") as f:
        gsc = json.load(f)
        
    for akey in gsc["Term_Order"]:
        if (len(gsc[akey]["Genes"]) > 20) and (len(gsc[akey]["Genes"]) < 30):
            genes = gsc[akey]["Genes"]
            np.savetxt(f"{dir1}/geneset_{sp_trn}.txt",genes,fmt="%s")
            num_genes = len(genes)
            term_name = gsc[akey]["Name"]
            gene_str = ",".join(genes)
            gcp_info.append(f"{sp_trn}_{akey}_{term_name}_{num_genes}")
            for sp_tst in ["Human","Mouse","Zebrafish","Fly","Worm","Yeast"]:
                for gsc in ["Combined", "GO", "Monarch"]: ###### need to add DisGeNet but onyl select cases
                    for net_type in ["BioGRID","STRING","IMP"]:
                        gcp_info.append(f"{sp_tst}_{gsc}_{net_type}")
                        gcp_str = f'curl "https://us-central1-gap-som-dbmi-geneplx-app-p0n.cloudfunctions.net/gpz-ml?geneids={gene_str}&sp_trn={sp_trn}&sp_tst={sp_tst}&gsc={gsc}&net_type={net_type}"'
                        gcp_info.append(gcp_str)
            gcp_info.append("")
            with open(f"{dir1}/gcp_calls.txt", "w") as thefile:
                for item in gcp_info:
                    thefile.write("%s\n" % item)
            break
