# job-shop-collection-web
React app of the Job Shop Collection website.

## How to run locally
```
git clone https://github.com/michaelyinopen/job-shop-collection-web
cd job-shop-collection-web
npm install
npm start
```
Run locally `job-shop-collection-web` to handle the API requests. Make sure the "proxy" in package.json matches the launch settings of API. 

## Environment variables
- REACT_APP_API_URL
- REACT_APP_HOST\
Used with `hostConstants.js` for  Home page's 'This application is built with' section.
- CI\
Set to true and warning will be treated as error.\
Most CI servers set it automatically.

Do not need these environment variables when running locally.

## Deployment on Azure
The React App is hosted with Azure Blob Storage Static Website.

The Static Website is integrated with Azure CDN. An URL rewrite rule is configured for routing of SPA, check Blob Service | Azure CDN | The Endpoint | Rules Engine.

### Manually deploy with VS Code Azure Storage extension
1. Install the extension `Azure Storage` in VS Code
2. Set environment variables
```
$env:REACT_APP_API_URL = "https://job-shop-collection-api.azurewebsites.net"
$env:REACT_APP_HOST = "Azure"
$env:CI = $true
```
3. Build the react app.
```
npm run-script build
```
4. Right-click `build` folder and `Deploy to Static Webaite via Azure Storage...`

Check the files with Microsoft Azure Storage Explorer (installed).

## Continuous Deployment by Github Actions
Github Actions workflow
- Build React App
- Login to Azure
- Upload to Blob Storage
- Purge CDN endpoint
- Logout of Azure

### Generate Azure credential for github actions secret
In Azure CLI
```
az ad sp create-for-rbac --sdk-auth --name "job-shop-collection-web-publisher" --role contributor --scopes /subscriptions/d1fef207-a33e-4536-bead-9ab97bbf6001/resourceGroups/JobShopCollectionResourceGroup/providers/Microsoft.Storage/storageAccounts/jobshopcollectionblob /subscriptions/d1fef207-a33e-4536-bead-9ab97bbf6001/resourceGroups/JobShopCollectionResourceGroup/providers/Microsoft.Cdn/profiles/jobshopcollection/endpoints/jobshopcollection
```
Save the output json as `AZURE_CREDENTIALS` in Github repository secrets.

