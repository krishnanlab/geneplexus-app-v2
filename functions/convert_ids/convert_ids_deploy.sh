#!/bin/bash

cd convert_ids_deploy

gcloud functions deploy gpz-convert-ids \
    --gen2 \
    --runtime=python311 \
    --region=us-central1 \
    --source=. \
    --entry-point=convert_ids \
    --trigger-http \
    --allow-unauthenticated \
    --memory=1024MB \
    --service-account=logging-monitoring@gap-som-dbmi-geneplx-app-p0n.iam.gserviceaccount.com

