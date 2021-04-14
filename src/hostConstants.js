import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

const useDeploymentMethodAzure = () => {
    const [lastDeployedDate, setLastDeployedDate] = useState("");
    useEffect(() => {
        const fetchLastDeployedDate = async () => {
            try {
                const response = await fetch(`https://api.github.com/repos/michaelyinopen/job-shop-collection-web/actions/workflows/main_azure.yml/runs?per_page=1&status=success`);
                if (!response.ok) {
                    console.log("Failed to get the last deployed date");
                    return;
                }
                let responseBody;
                responseBody = await response.json();
                const lastDeploymentDate = new Date(responseBody.workflow_runs[0].updated_at);
                setLastDeployedDate(" on " + format(lastDeploymentDate, 'yyyy-MM-dd'));
            }
            catch (e) {
                console.log("Failed to get the last deployed date");
                return;
            }
        };
        fetchLastDeployedDate();
    });
    return (
        <>
            Continuous deployment with <a href='https://github.com/michaelyinopen/job-shop-collection-web/actions/'>Github Actions</a>{lastDeployedDate}
        </>
    );
}

const azureConstants = {
    hostName: "Azure",
    hostLink: "https://azure.microsoft.com/",
    useDeploymentMethod: useDeploymentMethodAzure
}

const hostConstants = {
    Azure: azureConstants
};

export default hostConstants;