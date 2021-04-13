# job-shop-collection-web
React app of the Job Shop Collection website.

## Manually deploy with VS Code Azure Storage extension
1. Install the extension in VS Code
2. Build the react app. (Set environment variables)
3. Right-click `build` folder and `Deploy to Static Webaite via Azure Storage...`

## static index.html
Need to use `<HashRouter>` and have ugly paths `http://www.example.com/#/other-page`

## Adding Temporary Environment Variables: Windows (Powershell)
```
($env:PUBLIC_URL = "https://job-shop-collection-api.azurewebsites.net") -and (npm run build)
```