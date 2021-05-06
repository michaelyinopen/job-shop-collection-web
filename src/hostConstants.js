import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

const useBuiltWithsAzure = () => {
    const [apiLastDeployedDate, setApiLastDeployedDate] = useState("");
    useEffect(() => {
        const fetchApiLastDeployedDate = async () => {
            try {
                const response = await fetch(`https://api.github.com/repos/michaelyinopen/job-shop-collection-api/actions/workflows/main_job-shop-collection-api.yml/runs?per_page=1&status=success`);
                if (!response.ok) {
                    console.log("Failed to get api last deployed date");
                    return;
                }
                let responseBody;
                responseBody = await response.json();
                const apiLastDeploymentDate = new Date(responseBody.workflow_runs[0].updated_at);
                setApiLastDeployedDate(" on " + format(apiLastDeploymentDate, 'yyyy-MM-dd'));
            }
            catch (e) {
                console.log("Failed to get api last deployed date");
                return;
            }
        };
        fetchApiLastDeployedDate();
    }, []);
    const [webLastDeployedDate, setWebLastDeployedDate] = useState("");
    useEffect(() => {
        const fetchWebLastDeployedDate = async () => {
            try {
                const response = await fetch(`https://api.github.com/repos/michaelyinopen/job-shop-collection-web/actions/workflows/main_azure.yml/runs?per_page=1&status=success`);
                if (!response.ok) {
                    console.log("Failed to get web last deployed date");
                    return;
                }
                let responseBody;
                responseBody = await response.json();
                const webLastDeploymentDate = new Date(responseBody.workflow_runs[0].updated_at);
                setWebLastDeployedDate(" on " + format(webLastDeploymentDate, 'yyyy-MM-dd'));
            }
            catch (e) {
                console.log("Failed to get web last deployed date");
                return;
            }
        };
        fetchWebLastDeployedDate();
    }, []);
    return [
        (<>
            Web API and Database hosted on <a href="https://azure.microsoft.com/en-au/services/app-service/">Azure Web Service</a> and <a href="https://azure.microsoft.com/en-au/services/sql-database/">Azure SQL Database</a><br/>
            Continuously deployed {apiLastDeployedDate} with <a href='https://github.com/michaelyinopen/job-shop-collection-api/actions/workflows/main_job-shop-collection-api.yml'>this Github Actions workflow</a>
        </>),
        (<>
            React App hosted on <a href="https://azure.microsoft.com/en-au/services/storage/blobs/">Azure Blob Storage</a> with a CDN<br/>
            Continuously deployed {webLastDeployedDate} with <a href='https://github.com/michaelyinopen/job-shop-collection-web/actions/workflows/main_azure.yml'>this Github Actions workflow</a>
        </>),
    ];
}

const azureConstants = {
    useBuiltWiths: useBuiltWithsAzure
}

const useBuiltWithsLinode = () => {
    const [apiLastDeployedDate, setApiLastDeployedDate] = useState("");
    useEffect(() => {
        const fetchApiLastDeployedDate = async () => {
            try {
                const response = await fetch(`https://api.github.com/repos/michaelyinopen/job-shop-collection-api/actions/workflows/main_azure.yml/runs?per_page=1&status=success`);
                if (!response.ok) {
                    console.log("Failed to get api last deployed date");
                    return;
                }
                let responseBody;
                responseBody = await response.json();
                const apiLastDeploymentDate = new Date(responseBody.workflow_runs[0].updated_at);
                setApiLastDeployedDate(" on " + format(apiLastDeploymentDate, 'yyyy-MM-dd'));
            }
            catch (e) {
                console.log("Failed to get api last deployed date");
                return;
            }
        };
        fetchApiLastDeployedDate();
    }, []);
    const [webLastDeployedDate, setWebLastDeployedDate] = useState("");
    useEffect(() => {
        const fetchWebLastDeployedDate = async () => {
            try {
                const response = await fetch(`https://api.github.com/repos/michaelyinopen/job-shop-collection-web/actions/workflows/main_linode.yml/runs?per_page=1&status=success`);
                if (!response.ok) {
                    console.log("Failed to get web last deployed date");
                    return;
                }
                let responseBody;
                responseBody = await response.json();
                const webLastDeploymentDate = new Date(responseBody.workflow_runs[0].updated_at);
                setWebLastDeployedDate(" on " + format(webLastDeploymentDate, 'yyyy-MM-dd'));
            }
            catch (e) {
                console.log("Failed to get web last deployed date");
                return;
            }
        };
        fetchWebLastDeployedDate();
    }, []);
    return [
        (<>
            Web API hosted on a Debian on <a href="https://www.linode.com/">Linode</a><br/>
            <a href="https://docs.microsoft.com/en-us/sql/linux/quickstart-install-connect-ubuntu?view=sql-server-ver15">SQL Server 2019 Express</a> database hosted on a Ubuntu on <a href="https://www.linode.com/">Linode</a><br/>
            Continuously deployed {apiLastDeployedDate} with <a href='https://github.com/michaelyinopen/job-shop-collection-api/actions/workflows/main_linode.yml'>this Github Actions workflow</a>
        </>),
        (<>
            React App hosted on <a href="https://www.linode.com/">Linode</a> with a Reverse Proxy to proxy api requests<br/>
            Continuously deployed {webLastDeployedDate} with <a href='https://github.com/michaelyinopen/job-shop-collection-web/actions/workflows/main_linode.yml'>this Github Actions workflow</a>
        </>),
    ];
}

const linodeConstants = {
    useBuiltWiths: useBuiltWithsLinode
}

const hostConstants = {
    Azure: azureConstants,
    Linode: linodeConstants
};

export default hostConstants;