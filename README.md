# job-shop-collection-web
React app of the [Job Shop Collection website](https://job-shop-collection.michael-yin.net).

## How to run locally
```
git clone https://github.com/michaelyinopen/job-shop-collection-web
cd job-shop-collection-web
npm install
npm start
```
Run locally [job-shop-collection-api](https://github.com/michaelyinopen/job-shop-collection-api) to handle the API requests. Make sure the "proxy" in package.json matches the launch settings of API.

## How to run cosmos locally
react-cosmos is used as the component library for development
```
npm run cosmos
```

## Environment variables
- REACT_APP_API_URL
- REACT_APP_HOST\
Used with `hostConstants.js` for  Home page's 'This application is built with' section.
- CI\
Set to true and warning will be treated as error.\
Most CI servers set it automatically.

Do not need these environment variables when running locally.

## Deployment
[deployment](deployment.README.md)

## Useful for testing the built files
```
npm install http-server --save-dev
npm run start-production
```

## Useful for viewing the bundles
```
npm run build -- --stats
npx webpack-bundle-analyzer ./build/bundle-stats.json
```
