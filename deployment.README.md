# Deployment

## Hosted on Linode
The website can be visited on [job-shop-collection.michael-yin.net](https://job-shop-collection.michael-yin.net).

The React app is hosted on a Linode server with domain job-shop-collection.michael-yin.net. On the same machine, a Nginx reverse proxy is setup to
- server the react app and static files
- proxy api requests to the api server
- server SPA routes with index.html

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
<details>
<Summary>Content is updated again when configuring reverse proxy</summary>
<pre><code>server {
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
}</code></pre>
</details>

### Continuous Deployment by Github Actions
Command to change right of the directory rsync copies to
```
sudo chmod 755 -R /var/www/example.com
sudo chown -R example_user /var/www/example.com
```


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

### Reverse proxy api requests
Update /etc/nginx/sites-available/job-shop-collection.michael-yin.net
```
upstream api_server {
    server 172.105.169.200;
}

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

    # Proxy api request to upstream api
    location /api {
        proxy_pass http://api_server/api;
    }

    # Any route that doesn't have a file extension (e.g. /devices)
    location / {
        try_files $uri $uri/ /index.html;
    }
}
``` 
```
sudo ln -s /etc/nginx/sites-available/job-shop-collection.michael-yin.net /etc/nginx/sites-enabl
ed/
```
### Https
The website uses free SSL certificate issued by Let's Encrypt.\
Follow instructions in https://certbot.eff.org/lets-encrypt/debianbuster-nginx.

```
sudo apt install snapd
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot --nginx
```
/etc/nginx/sites-available/job-shop-collection.michael-yin.net will be updated with blocks managed by Certbot.

### http2
Manually edited these two lines to support http2
```
    listen [::]:443 ssl http2 ipv6only=on; # managed by Certbot
    listen 443 ssl http2; # managed by Certbot
```

### Cache control
Added these sections for cache control.
```
    location ~* \.(js|css|jpg|jpeg|png|gif|js|css|ico|swf|mp4)$ {
      try_files $uri =404;
      expires 1y;
      etag off;
      if_modified_since off;
      add_header Cache-Control "public, no-transform";
    }

    location ~* \.(html)$ {
      try_files $uri =404;
      etag on;
      add_header Cache-Control "no-cache";
    }
```

### Enable gzip
```
server {
    server_name  job-shop-collection.michael-yin.net;
    gzip_static on;
    gzip_proxied  any;
```
