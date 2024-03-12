#!/bin/bash

for aspecies in "Human" "Mouse" "Zebrafish" "Fly" "Worm" "Yeast";
do
	if [ "$aspecies" == "Human" ];
	then
		cd convert_ids_$aspecies
	else
		cd ../convert_ids_$aspecies
	fi
	gcloud functions deploy gpz-convert-ids-$aspecies \
	    --gen2 \
	    --runtime=python311 \
	    --region=us-central1 \
	    --source=. \
	    --entry-point=convert_ids \
	    --trigger-http \
	    --allow-unauthenticated \
	    --memory=1024MB \
	    --service-account=logging-monitoring@gap-som-dbmi-geneplx-app-p0n.iam.gserviceaccount.com
done

