# job-shop-collection-web
React app of the Job Shop Collection website.

## How to run locally
```
git clone https://github.com/michaelyinopen/job-shop-collection-web
cd job-shop-collection-web
npm install
npm start
```
Run locally [job-shop-collection-api](https://github.com/michaelyinopen/job-shop-collection-api) to handle the API requests. Make sure the "proxy" in package.json matches the launch settings of API. 

## Environment variables
- REACT_APP_API_URL
- REACT_APP_HOST\
Used with `hostConstants.js` for  Home page's 'This application is built with' section.
- CI\
Set to true and warning will be treated as error.\
Most CI servers set it automatically.

Do not need these environment variables when running locally.

## Hosted on Azure
The React App is hosted with Azure Blob Storage Static Website.

The Static Website is integrated with Azure CDN. An URL rewrite rule is configured for routing of SPA, check Blob Service | Azure CDN | The Endpoint | Rules Engine.

The website can be visited on [jobshopcollection.azureedge.net](http://jobshopcollection.azureedge.net).

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

### Continuous Deployment by Github Actions
[This Github Action](https://github.com/michaelyinopen/job-shop-collection-web/actions/workflows/main_azure.yml) workflow
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

### Domain azure.job-shop-collection.michael-yin.net
Using a domain michael-yin.net at Google Domains. Configure the DNS by adding a CNAME record with name `azure.job-shop-collection` and Data `jobshopcollection.azureedge.net.`.

At Blob Service | Azure CDN | The Endpoint | Custom Domains, add a hostname `azure.job-shop-collection.michael-yin.net`, with custom domain HTTPS configured by Azure.

The website can be visited on [azure.job-shop-collection.michael-yin.net](http://azure.job-shop-collection.michael-yin.net).

## Hosted on Linode
The React app is hosted on a Linode server with domain job-shop-collection.michael-yin.net. On the same machine, a Nginx reverse proxy is setup to
- server the react app
- server SPA routes with index.html
- proxy api requests to the api server

### Setup server
https://www.linode.com/docs/guides/getting-started/

Host name job-shop-collection-web

https://www.linode.com/docs/guides/securing-your-server/

check back for firewall and Remove Unused Network-Facing Services

https://www.linode.com/docs/guides/how-to-deploy-a-react-app-on-debian-10/

Install Rsync
```
sudo apt install rsync
```

Do not need to install git and Node.

https://www.linode.com/docs/guides/how-to-install-nginx-debian-10/

Install Nginx
```
sudo apt install nginx
```

#### Configure Nginx
/etc/nginx/sites-available/job-shop-collection.michael-yin.net
```
server {
    listen 80;
    listen [::]:80;
    server_name  job-shop-collection.michael-yin.net;

    root /var/www/job-shop-collection.michael-yin.net;
    index index.html;

    # Any route containing a file extension (e.g. /devicesfile.js)
    location ~ ^.+\..+$ {
      try_files $uri =404;
    }

    # Any route that doesn't have a file extension (e.g. /devices)
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Continuous Deployment by Github Actions

Generate ssh key pair. e.g. on Windows CMD

```
ssh-keygen -m PEM -t rsa -b 4096
```

Copy public key to /home/michael/.ssh/authorized_keys of server
```
mkdir -p ~/.ssh
```

Copy private key to https://github.com/michaelyinopen/job-shop-collection-web/settings/secrets/actions as repository secret LINODE_SSH_PRIVATE_KEY.

Set other Github repository secrets
- LINODE_HOST\
the public IP
- LINODE_PORT\
22
- LINODE_USER
- LINODE_DIRECTORY

[This Github Action](https://github.com/michaelyinopen/job-shop-collection-web/actions/workflows/main_linode.yml) workflow

- Build React App
- Rsync copy files to Linode

### Domain job-shop-collection.michael-yin.net
Using a domain michael-yin.net at Google Domains. Configure the DNS by adding
- an `A` record with name `job-shop-collection` and Data \<the web server's IPv4 address>.
- an `AAAA` record with name `job-shop-collection` and Data \<the web server's IPv6 address>.

The website can be visited on [job-shop-collection.michael-yin.net](http://job-shop-collection.michael-yin.net).

// todo reverse proxy for calls to api
// todo Configure ASP.NET Core to work with proxy servers
// todo https