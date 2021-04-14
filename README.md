# job-shop-collection-web
React app of the Job Shop Collection website.

## Manually deploy with VS Code Azure Storage extension
1. Install the extension in VS Code
2. Set environment variables
```
$env:REACT_APP_API_URL = "https://job-shop-collection-api.azurewebsites.net"
```
3. Build the react app.
```
npm run-script build
```
4. Right-click `build` folder and `Deploy to Static Webaite via Azure Storage...`

## static index.html
Need to use `<HashRouter>` and have ugly paths `http://www.example.com/#/other-page`

## generate azure credential for github actions secret
In Azure CLI
```
az ad sp create-for-rbac --sdk-auth --name "job-shop-collection-web-publisher" --role contributor --scopes /subscriptions/d1fef207-a33e-4536-bead-9ab97bbf6001/resourceGroups/JobShopCollectionResourceGroup/providers/Microsoft.Storage/storageAccounts/jobshopcollectionblob /subscriptions/d1fef207-a33e-4536-bead-9ab97bbf6001/resourceGroups/JobShopCollectionResourceGroup/providers/Microsoft.Cdn/profiles/jobshopcollection/endpoints/jobshopcollection
```

# Environment variables
- REACT_APP_API_URL
- REACT_APP_HOST
Used with `hostConstants.js` for  Home page's 'This application is built with' section.
