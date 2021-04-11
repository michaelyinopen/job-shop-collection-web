import { getJobSetsApiAsync } from '../api'
import createRequestScope from '../functions/createRequestScope';

// this request calls apis in a recursive function, until the last request does not return a nextPageToken
// returns the array of (elements of response.data)
const jobSetsRequest = async (pageToken) => {
  const responseJson = await getJobSetsApiAsync(pageToken);
  if (!responseJson.nextPageToken && responseJson.nextPageToken !== 0) {
    return [...responseJson.data];
  }
  const otherData = await jobSetsRequest(responseJson.nextPageToken);
  return [...responseJson.data, ...otherData];
};

const jobSetsRequestScope = createRequestScope();

const getJobSetsRequest = (
  getJobSetsBeginCallback,
  getJobSetsSucceedCallback,
  getJobSetsFailedcallback
) => {
  const beginCallback = getJobSetsBeginCallback;
  const successCallback = (result, isLoading) => {
    if (!isLoading) {
      getJobSetsSucceedCallback(result);
    }
  };
  const failedCallback = (error, isLoading) => {
    if (!isLoading) {
      getJobSetsFailedcallback(error.message)
    }
  };

  const request = () => jobSetsRequestScope.getRequest(
    beginCallback,
    successCallback,
    failedCallback
  )(jobSetsRequest);

  return request;
};

export default getJobSetsRequest;