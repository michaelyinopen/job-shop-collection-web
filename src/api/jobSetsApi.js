import template from 'url-template';

// page token is optional parameter
// returns promise of
// {
//   data,
//   nextPageToken
// }
// data is an array of jobSetHeaderDto
export const getJobSetsUrlTemplate = `api/job-sets{?pageToken}`;
export async function getJobSetsApiAsync(pageToken) {
  const url = template.parse(getJobSetsUrlTemplate).expand({ pageToken });
  const response = await fetch(url);
  if (!response.ok) {
    // maybe error message?
    throw Error(response.statusText);
  }
  let responseBody;
  try {
    responseBody = await response.json();
  }
  catch (e) {
    throw new Error(`Wrong api response format. ${e.message}`);
  }
  if (!responseBody.data) {
    throw Error("No data in api response.");
  }
  return responseBody;
};

export const createJobSetUrlTemplate = `api/job-sets`;
export async function createJobSetApiAsync(jobSet) {
  const url = createJobSetUrlTemplate;
  const init = {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify(jobSet)
  };
  const response = await fetch(url, init);
  if (!response.ok) {
    // maybe error message?
    throw Error(response.statusText);
  }
  let responseBody;
  try {
    responseBody = await response.json();
  }
  catch (e) {
    throw new Error(`Wrong api response format. ${e.message}`);
  }
  return responseBody;
};


export const getJobSetUrlTemplate = `api/job-sets/{id}`;
export async function getJobSetApiAsync(id) {
  const url = template.parse(getJobSetUrlTemplate).expand({ id });
  const response = await fetch(url);
  if (!response.ok) {
    // maybe error message?
    // todo handle pre-condition failed
    throw Error(response.statusText);
  }
  let responseBody;
  try {
    responseBody = await response.json();
  }
  catch (e) {
    throw new Error(`Wrong api response format. ${e.message}`);
  }
  return responseBody;
};

export const updateJobSetUrlTemplate = `api/job-sets/{id}`;
export async function updateJobSetApiAsync(id, jobSet, eTag) {
  const url =template.parse(updateJobSetUrlTemplate).expand({ id });
  const init = {
    method: "PUT",
    headers: {
      "If-Match": eTag,
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify(jobSet)
  };
  const response = await fetch(url, init);
  if (!response.ok) {
    // maybe error message?
    throw Error(response.statusText);
  }
  let responseBody;
  try {
    responseBody = await response.json();
  }
  catch (e) {
    throw new Error(`Wrong api response format. ${e.message}`);
  }
  return responseBody;
};

export const deleteJobSetUrlTemplate = `api/job-sets/{id}`;
export async function deleteJobSetApiAsync(id, eTag) {
  const url = template.parse(deleteJobSetUrlTemplate).expand({ id });
  const init = !eTag ?
    { method: "DELETE" } :
    {
      method: "DELETE",
      headers: {
        "If-Match": eTag
      }
    };
  const response = await fetch(url, init);
  if (!response.ok) {
    throw Error(response.statusText);
  }
};