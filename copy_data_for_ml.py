import glob
import shutil

fp_data = "/Users/mancchri/Desktop/CIDA_unsorted/Pat_api_test/PyGenePlexusDataZipUnzip/"
fp_fun = "/Users/mancchri/Desktop/repos/gp-gcp-functions/functions/"

anet = "GIANT-TN"
abg = "GO"

files_to_copy = []

# get ID conversion files
FNs_tmp = glob.glob(f"{fp_data}IDconversion*.json")
files_to_copy.extend(FNs_tmp)

# get node orders
FNs_tmp = glob.glob(f"{fp_data}NodeOrder*.txt")
files_to_copy.extend(FNs_tmp)

# get data file
FNs_tmp = glob.glob(f"{fp_data}Data_Embedding_{anet}.npy")
files_to_copy.extend(FNs_tmp)

# get edgelist
FNs_tmp = glob.glob(f"{fp_data}Edgelist_{anet}.edg")
files_to_copy.extend(FNs_tmp)

# GSC files
FNs_tmp = glob.glob(f"{fp_data}GSC_{abg}_{anet}*")
files_to_copy.extend(FNs_tmp)

# get correction correction matrices
FNs_tmp = glob.glob(f"{fp_data}CorrectionMatrix_{abg}*_{anet}_Embedding.npy")
files_to_copy.extend(FNs_tmp)
FNs_tmp = glob.glob(f"{fp_data}CorrectionMatrixOrder_*_{anet}.txt")
files_to_copy.extend(FNs_tmp)

# get pretrained weights
FNs_tmp = glob.glob(f"{fp_data}PreTrainedWeights_*_{anet}_Embedding.json")
files_to_copy.extend(FNs_tmp)

for afile in files_to_copy:
    basename = afile.strip().split("/")[-1]
    file_dest = f"{fp_fun}ML_{anet}_{abg}/data/{basename}"
    shutil.copyfile(afile,file_dest)