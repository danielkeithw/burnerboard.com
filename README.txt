Used to manage media and other items for burner boards.

//set auth to my credentials.
gcloud auth application-default login

//deploy to burnerboard.com
cd client
npm run build // this is new after changing to node standard.
cd ..
gcloud app deploy

// create indexes
gcloud datastore create-indexes index.yaml
 