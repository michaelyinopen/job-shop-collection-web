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