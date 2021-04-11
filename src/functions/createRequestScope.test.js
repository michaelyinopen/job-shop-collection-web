import createRequestScope from './createRequestScope';

const wait = ms => new Promise((r, j) => setTimeout(r, ms));

test("Can Create Request Scope", () => {
  const requestScope = createRequestScope();
  expect(typeof (requestScope.getRequest)).toBe('function')
});

test("Get Request returns a function", () => {
  const mockBeginCallback = jest.fn();
  const mockSuccessCallback = jest.fn();
  const mockFailedCallback = jest.fn();

  const requestScope = createRequestScope();
  const request = requestScope.getRequest(
    mockBeginCallback,
    mockSuccessCallback,
    mockFailedCallback
  );
  expect(typeof (request)).toBe('function');
});

test("Sample success request", async (done) => {
  const apiData = { data: "api response data" };
  const mockBeginCallback = jest.fn();
  const mockSuccessCallback = jest.fn();
  const mockFailedCallback = jest.fn();

  const mockApiFunctionAsync = jest.fn(async () => {
    await wait(10);
    return apiData;
  });

  const requestScope = createRequestScope();
  const request = requestScope.getRequest(
    mockBeginCallback,
    mockSuccessCallback,
    mockFailedCallback
  );
  await request(mockApiFunctionAsync);

  expect(mockBeginCallback).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback).toHaveBeenCalledWith();

  expect(mockApiFunctionAsync).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync).toHaveBeenCalledWith();

  expect(mockSuccessCallback).toHaveBeenCalledTimes(1);
  expect(mockSuccessCallback).toHaveBeenCalledWith(apiData, false);

  expect(mockFailedCallback).not.toHaveBeenCalled();

  done();
});

describe("Success request detail", () => {
  const apiData = { data: "api response data" };
  let mockBeginCallback;
  let mockSuccessCallback;
  let mockFailedCallback;
  let mockApiFunctionAsync;

  beforeEach(() => {
    mockBeginCallback = jest.fn();
    mockSuccessCallback = jest.fn();
    mockFailedCallback = jest.fn();

    mockApiFunctionAsync = jest.fn(async () => {
      await wait(10);
      return apiData;
    });
  });

  test("Can call api request", async (done) => {
    const requestScope = createRequestScope();
    const request = requestScope.getRequest(
      mockBeginCallback,
      mockSuccessCallback,
      mockFailedCallback
    );
    await request(mockApiFunctionAsync);
    done();
  });

  test("Begin Callback called correctly", async (done) => {
    const requestScope = createRequestScope();
    const request = requestScope.getRequest(
      mockBeginCallback,
      mockSuccessCallback,
      mockFailedCallback
    );
    await request(mockApiFunctionAsync);

    expect(mockBeginCallback).toHaveBeenCalledTimes(1);
    expect(mockBeginCallback).toHaveBeenCalledWith();

    done();
  });

  test("Api function called correctly", async (done) => {
    const requestScope = createRequestScope();
    const request = requestScope.getRequest(
      mockBeginCallback,
      mockSuccessCallback,
      mockFailedCallback
    );
    await request(mockApiFunctionAsync);

    expect(mockApiFunctionAsync).toHaveBeenCalledTimes(1);
    expect(mockApiFunctionAsync).toHaveBeenCalledWith();

    done();
  });

  test("Success Callback called correctly", async (done) => {
    const requestScope = createRequestScope();
    const request = requestScope.getRequest(
      mockBeginCallback,
      mockSuccessCallback,
      mockFailedCallback
    );
    await request(mockApiFunctionAsync);

    expect(mockSuccessCallback).toHaveBeenCalledTimes(1);
    expect(mockSuccessCallback).toHaveBeenCalledWith(apiData, false);

    done();
  });

  test("Failed Callback not called", async (done) => {
    const requestScope = createRequestScope();
    const request = requestScope.getRequest(
      mockBeginCallback,
      mockSuccessCallback,
      mockFailedCallback
    );
    await request(mockApiFunctionAsync);

    expect(mockFailedCallback).not.toHaveBeenCalled();

    done();
  });
});

test("Sample faulty request", async (done) => {
  const errorMessage = "test error";
  const mockBeginCallback = jest.fn();
  const mockSuccessCallback = jest.fn();
  const mockFailedCallback = jest.fn();

  const mockApiFunctionAsync = jest.fn(async () => {
    await wait(10);
    throw new Error(errorMessage);
  });

  const requestScope = createRequestScope();
  const request = requestScope.getRequest(
    mockBeginCallback,
    mockSuccessCallback,
    mockFailedCallback
  );
  await request(mockApiFunctionAsync);

  expect(mockBeginCallback).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback).toHaveBeenCalledWith();

  expect(mockApiFunctionAsync).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync).toHaveBeenCalledWith();

  expect(mockSuccessCallback).not.toHaveBeenCalled();

  expect(mockFailedCallback).toHaveBeenCalledTimes(1);
  expect(mockFailedCallback.mock.calls[0].length).toBe(2); // two arguments
  expect(mockFailedCallback.mock.calls[0][0].message).toBe(errorMessage);
  expect(mockFailedCallback.mock.calls[0][1]).toBe(false);

  done();
});

describe("Faulty request detail", () => {
  const errorMessage = "test error";
  let mockBeginCallback;
  let mockSuccessCallback;
  let mockFailedCallback;
  let mockApiFunctionAsync;

  beforeEach(() => {
    mockBeginCallback = jest.fn();
    mockSuccessCallback = jest.fn();
    mockFailedCallback = jest.fn();

    mockApiFunctionAsync = jest.fn(async () => {
      await wait(10);
      throw new Error(errorMessage);
    });
  });

  test("Can call api request", async (done) => {
    const requestScope = createRequestScope();
    const request = requestScope.getRequest(
      mockBeginCallback,
      mockSuccessCallback,
      mockFailedCallback
    );
    await request(mockApiFunctionAsync);
    done();
  });

  test("Begin Callback called correctly", async (done) => {
    const requestScope = createRequestScope();
    const request = requestScope.getRequest(
      mockBeginCallback,
      mockSuccessCallback,
      mockFailedCallback
    );
    await request(mockApiFunctionAsync);

    expect(mockBeginCallback).toHaveBeenCalledTimes(1);
    expect(mockBeginCallback).toHaveBeenCalledWith();

    done();
  });

  test("Api function called correctly", async (done) => {
    const requestScope = createRequestScope();
    const request = requestScope.getRequest(
      mockBeginCallback,
      mockSuccessCallback,
      mockFailedCallback
    );
    await request(mockApiFunctionAsync);

    expect(mockApiFunctionAsync).toHaveBeenCalledTimes(1);
    expect(mockApiFunctionAsync).toHaveBeenCalledWith();

    done();
  });

  test("Success Callback not called", async (done) => {
    const requestScope = createRequestScope();
    const request = requestScope.getRequest(
      mockBeginCallback,
      mockSuccessCallback,
      mockFailedCallback
    );
    await request(mockApiFunctionAsync);

    expect(mockSuccessCallback).not.toHaveBeenCalled();

    done();
  });

  test("Failed Callback called correctly", async (done) => {
    const requestScope = createRequestScope();
    const request = requestScope.getRequest(
      mockBeginCallback,
      mockSuccessCallback,
      mockFailedCallback
    );
    await request(mockApiFunctionAsync);

    expect(mockFailedCallback).toHaveBeenCalledTimes(1);
    expect(mockFailedCallback.mock.calls[0].length).toBe(2); // two arguments
    expect(mockFailedCallback.mock.calls[0][0].message).toBe(errorMessage);
    expect(mockFailedCallback.mock.calls[0][1]).toBe(false);

    done();
  });
});

test("Sample Reuse request", async (done) => {
  const apiData = { data: "api response data" };
  const mockBeginCallback = jest.fn();
  const mockSuccessCallback = jest.fn();
  const mockFailedCallback = jest.fn();

  const mockApiFunctionAsync = jest.fn(async () => {
    await wait(10);
    return apiData;
  });

  const requestScope = createRequestScope();
  const request = requestScope.getRequest(
    mockBeginCallback,
    mockSuccessCallback,
    mockFailedCallback
  );
  await request(mockApiFunctionAsync);
  await request(mockApiFunctionAsync);

  expect(mockBeginCallback).toHaveBeenCalledTimes(2);
  expect(mockBeginCallback).toHaveBeenNthCalledWith(1);
  expect(mockBeginCallback).toHaveBeenNthCalledWith(2);

  expect(mockApiFunctionAsync).toHaveBeenCalledTimes(2);
  expect(mockApiFunctionAsync).toHaveBeenCalledWith();

  expect(mockSuccessCallback).toHaveBeenCalledTimes(2);
  expect(mockSuccessCallback).toHaveBeenNthCalledWith(1, apiData, false);
  expect(mockSuccessCallback).toHaveBeenNthCalledWith(2, apiData, false);

  expect(mockFailedCallback).not.toHaveBeenCalled();

  done();
});

test("Sample get multiple requests from request scope", async (done) => {
  const apiData1 = { data: "api response data 1" };
  const mockBeginCallback1 = jest.fn();
  const mockSuccessCallback1 = jest.fn();
  const mockFailedCallback1 = jest.fn();

  const mockApiFunctionAsync1 = jest.fn(async () => {
    await wait(10);
    return apiData1;
  });

  const apiData2 = { data: "api response data 2" };
  const mockBeginCallback2 = jest.fn();
  const mockSuccessCallback2 = jest.fn();
  const mockFailedCallback2 = jest.fn();

  const mockApiFunctionAsync2 = jest.fn(async () => {
    await wait(10);
    return apiData2;
  });

  const requestScope = createRequestScope();
  const request1 = requestScope.getRequest(
    mockBeginCallback1,
    mockSuccessCallback1,
    mockFailedCallback1
  );
  await request1(mockApiFunctionAsync1);

  expect(mockBeginCallback1).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback1).toHaveBeenCalledWith();

  expect(mockApiFunctionAsync1).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync1).toHaveBeenCalledWith();

  expect(mockSuccessCallback1).toHaveBeenCalledTimes(1);
  expect(mockSuccessCallback1).toHaveBeenCalledWith(apiData1, false);

  expect(mockFailedCallback1).not.toHaveBeenCalled();

  const request2 = requestScope.getRequest(
    mockBeginCallback2,
    mockSuccessCallback2,
    mockFailedCallback2
  );
  await request2(mockApiFunctionAsync2);

  expect(mockBeginCallback2).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback2).toHaveBeenCalledWith();

  expect(mockApiFunctionAsync2).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync2).toHaveBeenCalledWith();

  expect(mockSuccessCallback2).toHaveBeenCalledTimes(1);
  expect(mockSuccessCallback2).toHaveBeenCalledWith(apiData2, false);

  expect(mockFailedCallback2).not.toHaveBeenCalled();

  done();
});

test("Test with callHistory side effect", async (done) => {
  const apiData = { data: "api response data" };
  const callHistory = [];
  const mockBeginCallback = jest.fn(() => callHistory.push("begin"));
  const mockSuccessCallback = jest.fn(() => callHistory.push("success"));
  const mockFailedCallback = jest.fn(() => callHistory.push("failed"));

  const mockApiFunctionAsync = jest.fn(async () => {
    callHistory.push("apiFunc start");
    try {
      await wait(10);
      return apiData;
    }
    finally {
      callHistory.push("apiFunc end");
    }
  });

  const requestScope = createRequestScope();
  const request = requestScope.getRequest(
    mockBeginCallback,
    mockSuccessCallback,
    mockFailedCallback
  );
  await request(mockApiFunctionAsync);

  expect(callHistory).toEqual([
    "begin",
    "apiFunc start",
    "apiFunc end",
    "success",
  ]);

  done();
});

//#region two requests
// how to read:
// 1:   request 1 start
// -1:  request 1 returns
// -1x: request 1 returns by throwing error

// two requests 1, -1, 2, -2 (2a)
// two requests 1, 2, -1, -2 (2b)
// two requests 1, 2, -2, -1 (2c)

// two requests 1, -1x, 2, -2  (2a 1x)
// two requests 1, -1, 2, -2x  (2a 2x)
// two requests 1, -1x, 2, -2x (2a 1x2x)

// two requests 1, 2, -1x, -2  (2b 1x)
// two requests 1, 2, -1, -2x  (2b 2x)
// two requests 1, 2, -1x, -2x (2b 1x2x)

// two requests 1, 2, -2, -1x  (2c 1x)
// two requests 1, 2, -2x, -1  (2c 2x)
// two requests 1, 2, -2x, -1x (2c 1x2x)

test("2a", async (done) => {
  // two requests 1, -1, 2, -2 (2a)
  const apiData = { data: "api response data" };
  const callHistory = [];
  const mockBeginCallback = jest.fn(() => callHistory.push("begin"));
  const mockSuccessCallback = jest.fn(() => callHistory.push("success"));
  const mockFailedCallback = jest.fn(() => callHistory.push("failed"));

  const mockApiFunctionAsync = jest.fn(async () => {
    callHistory.push("apiFunc start");
    try {
      await wait(10);
      return apiData;
    }
    finally {
      callHistory.push("apiFunc end");
    }
  });

  const requestScope = createRequestScope();
  const request = requestScope.getRequest(
    mockBeginCallback,
    mockSuccessCallback,
    mockFailedCallback
  );
  await request(mockApiFunctionAsync);
  await request(mockApiFunctionAsync);

  expect(mockBeginCallback).toHaveBeenCalledTimes(2);
  expect(mockBeginCallback).toHaveBeenNthCalledWith(1);
  expect(mockBeginCallback).toHaveBeenNthCalledWith(2);

  expect(mockApiFunctionAsync).toHaveBeenCalledTimes(2);
  expect(mockApiFunctionAsync).toHaveBeenCalledWith();

  expect(mockSuccessCallback).toHaveBeenCalledTimes(2);
  expect(mockSuccessCallback).toHaveBeenNthCalledWith(1, apiData, false);
  expect(mockSuccessCallback).toHaveBeenNthCalledWith(2, apiData, false);

  expect(mockFailedCallback).not.toHaveBeenCalled();

  expect(callHistory).toEqual([
    "begin",
    "apiFunc start",
    "apiFunc end",
    "success",
    "begin",
    "apiFunc start",
    "apiFunc end",
    "success",
  ]);

  done();
});

test("2b", async (done) => {
  // two requests 1, 2, -1, -2 (2b)
  // note: when first request returns, successCallback1 is called with second parameter(loading) true
  const callHistory = [];

  const apiData1 = { data: "api response data 1" };
  const mockBeginCallback1 = jest.fn(() => callHistory.push("begin1"));
  const mockSuccessCallback1 = jest.fn(() => callHistory.push("success1"));
  const mockFailedCallback1 = jest.fn(() => callHistory.push("failed1"));

  const mockApiFunctionAsync1 = jest.fn(async () => {
    callHistory.push("apiFunc1 start");
    try {
      await wait(100);
      return apiData1;
    }
    finally {
      callHistory.push("apiFunc1 end");
    }
  });

  const apiData2 = { data: "api response data 2" };
  const mockBeginCallback2 = jest.fn(() => callHistory.push("begin2"));
  const mockSuccessCallback2 = jest.fn(() => callHistory.push("success2"));
  const mockFailedCallback2 = jest.fn(() => callHistory.push("failed2"));

  const mockApiFunctionAsync2 = jest.fn(async () => {
    callHistory.push("apiFunc2 start");
    try {
      await wait(200);
      return apiData2;
    }
    finally {
      callHistory.push("apiFunc2 end");
    }
  });

  const requestScope = createRequestScope();
  const request1 = requestScope.getRequest(
    mockBeginCallback1,
    mockSuccessCallback1,
    mockFailedCallback1
  );

  const request2 = requestScope.getRequest(
    mockBeginCallback2,
    mockSuccessCallback2,
    mockFailedCallback2
  );
  await Promise.all([
    request1(mockApiFunctionAsync1),
    request2(mockApiFunctionAsync2)
  ]);

  expect(mockBeginCallback1).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback1).toHaveBeenCalledWith();

  expect(mockApiFunctionAsync1).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync1).toHaveBeenCalledWith();

  expect(mockBeginCallback2).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback2).toHaveBeenCalledWith();

  expect(mockApiFunctionAsync2).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync2).toHaveBeenCalledWith();

  expect(mockSuccessCallback1).toHaveBeenCalledTimes(1);
  expect(mockSuccessCallback1).toHaveBeenCalledWith(apiData1, true); // loading

  expect(mockSuccessCallback2).toHaveBeenCalledTimes(1);
  expect(mockSuccessCallback2).toHaveBeenCalledWith(apiData2, false);

  expect(mockFailedCallback1).not.toHaveBeenCalled();

  expect(mockFailedCallback2).not.toHaveBeenCalled();

  expect(callHistory).toEqual([
    "begin1",
    "apiFunc1 start",
    "begin2",
    "apiFunc2 start",
    "apiFunc1 end",
    "success1",
    "apiFunc2 end",
    "success2",
  ]);

  done();
});

test("2c", async (done) => {
  // two requests 1, 2, -2, -1 (2c)
  const callHistory = [];

  const apiData1 = { data: "api response data 1" };
  const mockBeginCallback1 = jest.fn(() => callHistory.push("begin1"));
  const mockSuccessCallback1 = jest.fn(() => callHistory.push("success1"));
  const mockFailedCallback1 = jest.fn(() => callHistory.push("failed1"));

  const mockApiFunctionAsync1 = jest.fn(async () => {
    callHistory.push("apiFunc1 start");
    try {
      await wait(200);
      return apiData1;
    }
    finally {
      callHistory.push("apiFunc1 end");
    }
  });

  const apiData2 = { data: "api response data 2" };
  const mockBeginCallback2 = jest.fn(() => callHistory.push("begin2"));
  const mockSuccessCallback2 = jest.fn(() => callHistory.push("success2"));
  const mockFailedCallback2 = jest.fn(() => callHistory.push("failed2"));

  const mockApiFunctionAsync2 = jest.fn(async () => {
    callHistory.push("apiFunc2 start");
    try {
      await wait(100);
      return apiData2;
    }
    finally {
      callHistory.push("apiFunc2 end");
    }
  });

  const requestScope = createRequestScope();
  const request1 = requestScope.getRequest(
    mockBeginCallback1,
    mockSuccessCallback1,
    mockFailedCallback1
  );

  const request2 = requestScope.getRequest(
    mockBeginCallback2,
    mockSuccessCallback2,
    mockFailedCallback2
  );
  await Promise.all([
    request1(mockApiFunctionAsync1),
    request2(mockApiFunctionAsync2)
  ]);

  expect(mockBeginCallback1).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback1).toHaveBeenCalledWith();

  expect(mockApiFunctionAsync1).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync1).toHaveBeenCalledWith();

  expect(mockBeginCallback2).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback2).toHaveBeenCalledWith();

  expect(mockApiFunctionAsync2).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync2).toHaveBeenCalledWith();

  expect(mockSuccessCallback2).toHaveBeenCalledTimes(1);
  expect(mockSuccessCallback2).toHaveBeenCalledWith(apiData2, false);

  expect(mockSuccessCallback1).not.toHaveBeenCalled();

  expect(mockFailedCallback1).not.toHaveBeenCalled();

  expect(mockFailedCallback2).not.toHaveBeenCalled();

  expect(callHistory).toEqual([
    "begin1",
    "apiFunc1 start",
    "begin2",
    "apiFunc2 start",
    "apiFunc2 end",
    "success2",
    "apiFunc1 end"
  ]);

  done();
});

test("2a 1x", async (done) => {
  // two requests 1, -1x, 2, -2  (2a 1x)
  const callHistory = [];

  const errorMessage1 = "test error 1";
  const mockBeginCallback1 = jest.fn(() => callHistory.push("begin1"));
  const mockSuccessCallback1 = jest.fn(() => callHistory.push("success1"));
  const mockFailedCallback1 = jest.fn(() => callHistory.push("failed1"));

  const mockApiFunctionAsync1 = jest.fn(async () => {
    callHistory.push("apiFunc1 start");
    try {
      await wait(10);
      throw new Error(errorMessage1);
    }
    finally {
      callHistory.push("apiFunc1 end");
    }
  });

  const apiData2 = { data: "api response data 2" };
  const mockBeginCallback2 = jest.fn(() => callHistory.push("begin2"));
  const mockSuccessCallback2 = jest.fn(() => callHistory.push("success2"));
  const mockFailedCallback2 = jest.fn(() => callHistory.push("failed2"));

  const mockApiFunctionAsync2 = jest.fn(async () => {
    callHistory.push("apiFunc2 start");
    try {
      await wait(200);
      return apiData2;
    }
    finally {
      callHistory.push("apiFunc2 end");
    }
  });

  const requestScope = createRequestScope();
  const request1 = requestScope.getRequest(
    mockBeginCallback1,
    mockSuccessCallback1,
    mockFailedCallback1
  );

  const request2 = requestScope.getRequest(
    mockBeginCallback2,
    mockSuccessCallback2,
    mockFailedCallback2
  );
  await request1(mockApiFunctionAsync1);
  await request2(mockApiFunctionAsync2);

  expect(mockBeginCallback1).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback1).toHaveBeenCalledWith();

  expect(mockApiFunctionAsync1).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync1).toHaveBeenCalledWith();

  expect(mockFailedCallback1).toHaveBeenCalledTimes(1);
  expect(mockFailedCallback1.mock.calls[0].length).toBe(2); // two arguments
  expect(mockFailedCallback1.mock.calls[0][0].message).toBe(errorMessage1);
  expect(mockFailedCallback1.mock.calls[0][1]).toBe(false);

  expect(mockBeginCallback2).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback2).toHaveBeenCalledWith();

  expect(mockApiFunctionAsync2).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync2).toHaveBeenCalledWith();

  expect(mockSuccessCallback2).toHaveBeenCalledTimes(1);
  expect(mockSuccessCallback2).toHaveBeenCalledWith(apiData2, false);

  expect(mockSuccessCallback1).not.toHaveBeenCalled();

  expect(mockFailedCallback2).not.toHaveBeenCalled();

  expect(callHistory).toEqual([
    "begin1",
    "apiFunc1 start",
    "apiFunc1 end",
    "failed1",
    "begin2",
    "apiFunc2 start",
    "apiFunc2 end",
    "success2",
  ]);

  done();
});

test("2a 2x", async (done) => {
  // two requests 1, -1, 2, -2x  (2a 2x)
  const callHistory = [];

  const apiData1 = { data: "api response data 1" };
  const mockBeginCallback1 = jest.fn(() => callHistory.push("begin1"));
  const mockSuccessCallback1 = jest.fn(() => callHistory.push("success1"));
  const mockFailedCallback1 = jest.fn(() => callHistory.push("failed1"));

  const mockApiFunctionAsync1 = jest.fn(async () => {
    callHistory.push("apiFunc1 start");
    try {
      await wait(10);
      return apiData1;
    }
    finally {
      callHistory.push("apiFunc1 end");
    }
  });

  const errorMessage2 = "test error 2";
  const mockBeginCallback2 = jest.fn(() => callHistory.push("begin2"));
  const mockSuccessCallback2 = jest.fn(() => callHistory.push("success2"));
  const mockFailedCallback2 = jest.fn(() => callHistory.push("failed2"));

  const mockApiFunctionAsync2 = jest.fn(async () => {
    callHistory.push("apiFunc2 start");
    try {
      await wait(200);
      throw new Error(errorMessage2);
    }
    finally {
      callHistory.push("apiFunc2 end");
    }
  });

  const requestScope = createRequestScope();
  const request1 = requestScope.getRequest(
    mockBeginCallback1,
    mockSuccessCallback1,
    mockFailedCallback1
  );

  const request2 = requestScope.getRequest(
    mockBeginCallback2,
    mockSuccessCallback2,
    mockFailedCallback2
  );
  await request1(mockApiFunctionAsync1);
  await request2(mockApiFunctionAsync2);

  expect(mockBeginCallback1).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback1).toHaveBeenCalledWith();

  expect(mockApiFunctionAsync1).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync1).toHaveBeenCalledWith();

  expect(mockSuccessCallback1).toHaveBeenCalledTimes(1);
  expect(mockSuccessCallback1).toHaveBeenCalledWith(apiData1, false);

  expect(mockBeginCallback2).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback2).toHaveBeenCalledWith();

  expect(mockApiFunctionAsync2).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync2).toHaveBeenCalledWith();

  expect(mockFailedCallback2).toHaveBeenCalledTimes(1);
  expect(mockFailedCallback2.mock.calls[0].length).toBe(2); // two arguments
  expect(mockFailedCallback2.mock.calls[0][0].message).toBe(errorMessage2);
  expect(mockFailedCallback2.mock.calls[0][1]).toBe(false);

  expect(mockFailedCallback1).not.toHaveBeenCalled();

  expect(mockSuccessCallback2).not.toHaveBeenCalled();

  expect(callHistory).toEqual([
    "begin1",
    "apiFunc1 start",
    "apiFunc1 end",
    "success1",
    "begin2",
    "apiFunc2 start",
    "apiFunc2 end",
    "failed2",
  ]);

  done();
});

test("2a 1x2x", async (done) => {
  // two requests 1, -1x, 2, -2x  (2a 1x2x)
  const callHistory = [];

  const errorMessage1 = "test error 1";
  const mockBeginCallback1 = jest.fn(() => callHistory.push("begin1"));
  const mockSuccessCallback1 = jest.fn(() => callHistory.push("success1"));
  const mockFailedCallback1 = jest.fn(() => callHistory.push("failed1"));

  const mockApiFunctionAsync1 = jest.fn(async () => {
    callHistory.push("apiFunc1 start");
    try {
      await wait(10);
      throw new Error(errorMessage1);
    }
    finally {
      callHistory.push("apiFunc1 end");
    }
  });

  const errorMessage2 = "test error 2";
  const mockBeginCallback2 = jest.fn(() => callHistory.push("begin2"));
  const mockSuccessCallback2 = jest.fn(() => callHistory.push("success2"));
  const mockFailedCallback2 = jest.fn(() => callHistory.push("failed2"));

  const mockApiFunctionAsync2 = jest.fn(async () => {
    callHistory.push("apiFunc2 start");
    try {
      await wait(200);
      throw new Error(errorMessage2);
    }
    finally {
      callHistory.push("apiFunc2 end");
    }
  });

  const requestScope = createRequestScope();
  const request1 = requestScope.getRequest(
    mockBeginCallback1,
    mockSuccessCallback1,
    mockFailedCallback1
  );

  const request2 = requestScope.getRequest(
    mockBeginCallback2,
    mockSuccessCallback2,
    mockFailedCallback2
  );
  await request1(mockApiFunctionAsync1);
  await request2(mockApiFunctionAsync2);

  expect(mockBeginCallback1).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback1).toHaveBeenCalledWith();

  expect(mockApiFunctionAsync1).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync1).toHaveBeenCalledWith();

  expect(mockFailedCallback1).toHaveBeenCalledTimes(1);
  expect(mockFailedCallback1.mock.calls[0].length).toBe(2); // two arguments
  expect(mockFailedCallback1.mock.calls[0][0].message).toBe(errorMessage1);
  expect(mockFailedCallback1.mock.calls[0][1]).toBe(false);

  expect(mockBeginCallback2).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback2).toHaveBeenCalledWith();

  expect(mockApiFunctionAsync2).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync2).toHaveBeenCalledWith();

  expect(mockFailedCallback2).toHaveBeenCalledTimes(1);
  expect(mockFailedCallback2.mock.calls[0].length).toBe(2); // two arguments
  expect(mockFailedCallback2.mock.calls[0][0].message).toBe(errorMessage2);
  expect(mockFailedCallback2.mock.calls[0][1]).toBe(false);

  expect(mockSuccessCallback1).not.toHaveBeenCalled();

  expect(mockSuccessCallback2).not.toHaveBeenCalled();

  expect(callHistory).toEqual([
    "begin1",
    "apiFunc1 start",
    "apiFunc1 end",
    "failed1",
    "begin2",
    "apiFunc2 start",
    "apiFunc2 end",
    "failed2",
  ]);

  done();
});

test("2b 1x", async (done) => {
  // two requests 1, 2, -1x, -2  (2b 1x)
  // note: when first request returns, failedCallback1 is called with second parameter(loading) true
  const callHistory = [];

  const errorMessage1 = "test error 1";
  const mockBeginCallback1 = jest.fn(() => callHistory.push("begin1"));
  const mockSuccessCallback1 = jest.fn(() => callHistory.push("success1"));
  const mockFailedCallback1 = jest.fn(() => callHistory.push("failed1"));

  const mockApiFunctionAsync1 = jest.fn(async () => {
    callHistory.push("apiFunc1 start");
    try {
      await wait(100);
      throw new Error(errorMessage1);
    }
    finally {
      callHistory.push("apiFunc1 end");
    }
  });

  const apiData2 = { data: "api response data 2" };
  const mockBeginCallback2 = jest.fn(() => callHistory.push("begin2"));
  const mockSuccessCallback2 = jest.fn(() => callHistory.push("success2"));
  const mockFailedCallback2 = jest.fn(() => callHistory.push("failed2"));

  const mockApiFunctionAsync2 = jest.fn(async () => {
    callHistory.push("apiFunc2 start");
    try {
      await wait(200);
      return apiData2;
    }
    finally {
      callHistory.push("apiFunc2 end");
    }
  });

  const requestScope = createRequestScope();
  const request1 = requestScope.getRequest(
    mockBeginCallback1,
    mockSuccessCallback1,
    mockFailedCallback1
  );

  const request2 = requestScope.getRequest(
    mockBeginCallback2,
    mockSuccessCallback2,
    mockFailedCallback2
  );
  await Promise.all([
    request1(mockApiFunctionAsync1),
    request2(mockApiFunctionAsync2)
  ]);

  expect(mockBeginCallback1).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback1).toHaveBeenCalledWith();

  expect(mockApiFunctionAsync1).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync1).toHaveBeenCalledWith();

  expect(mockBeginCallback2).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback2).toHaveBeenCalledWith();

  expect(mockApiFunctionAsync2).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync2).toHaveBeenCalledWith();

  expect(mockFailedCallback1).toHaveBeenCalledTimes(1);
  expect(mockFailedCallback1.mock.calls[0].length).toBe(2); // two arguments
  expect(mockFailedCallback1.mock.calls[0][0].message).toBe(errorMessage1);
  expect(mockFailedCallback1.mock.calls[0][1]).toBe(true); // loading

  expect(mockSuccessCallback2).toHaveBeenCalledTimes(1);
  expect(mockSuccessCallback2).toHaveBeenCalledWith(apiData2, false);

  expect(mockSuccessCallback1).not.toHaveBeenCalled();

  expect(mockFailedCallback2).not.toHaveBeenCalled();

  expect(callHistory).toEqual([
    "begin1",
    "apiFunc1 start",
    "begin2",
    "apiFunc2 start",
    "apiFunc1 end",
    "failed1",
    "apiFunc2 end",
    "success2",
  ]);

  done();
});

test("2b 2x", async (done) => {
  // two requests 1, 2, -1, -2x  (2b 2x)
  // note: when first request returns, successCallback1 is called with second parameter(loading) true
  const callHistory = [];

  const apiData1 = { data: "api response data 1" };
  const mockBeginCallback1 = jest.fn(() => callHistory.push("begin1"));
  const mockSuccessCallback1 = jest.fn(() => callHistory.push("success1"));
  const mockFailedCallback1 = jest.fn(() => callHistory.push("failed1"));

  const mockApiFunctionAsync1 = jest.fn(async () => {
    callHistory.push("apiFunc1 start");
    try {
      await wait(100);
      return apiData1;
    }
    finally {
      callHistory.push("apiFunc1 end");
    }
  });

  const errorMessage2 = "test error 2";
  const mockBeginCallback2 = jest.fn(() => callHistory.push("begin2"));
  const mockSuccessCallback2 = jest.fn(() => callHistory.push("success2"));
  const mockFailedCallback2 = jest.fn(() => callHistory.push("failed2"));

  const mockApiFunctionAsync2 = jest.fn(async () => {
    callHistory.push("apiFunc2 start");
    try {
      await wait(200);
      throw new Error(errorMessage2);
    }
    finally {
      callHistory.push("apiFunc2 end");
    }
  });

  const requestScope = createRequestScope();
  const request1 = requestScope.getRequest(
    mockBeginCallback1,
    mockSuccessCallback1,
    mockFailedCallback1
  );

  const request2 = requestScope.getRequest(
    mockBeginCallback2,
    mockSuccessCallback2,
    mockFailedCallback2
  );
  await Promise.all([
    request1(mockApiFunctionAsync1),
    request2(mockApiFunctionAsync2)
  ]);

  expect(mockBeginCallback1).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback1).toHaveBeenCalledWith();

  expect(mockApiFunctionAsync1).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync1).toHaveBeenCalledWith();

  expect(mockBeginCallback2).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback2).toHaveBeenCalledWith();

  expect(mockApiFunctionAsync2).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync2).toHaveBeenCalledWith();

  expect(mockSuccessCallback1).toHaveBeenCalledTimes(1);
  expect(mockSuccessCallback1).toHaveBeenCalledWith(apiData1, true); // loading

  expect(mockFailedCallback2).toHaveBeenCalledTimes(1);
  expect(mockFailedCallback2.mock.calls[0].length).toBe(2); // two arguments
  expect(mockFailedCallback2.mock.calls[0][0].message).toBe(errorMessage2);
  expect(mockFailedCallback2.mock.calls[0][1]).toBe(false);

  expect(mockFailedCallback1).not.toHaveBeenCalled();

  expect(mockSuccessCallback2).not.toHaveBeenCalled();

  expect(callHistory).toEqual([
    "begin1",
    "apiFunc1 start",
    "begin2",
    "apiFunc2 start",
    "apiFunc1 end",
    "success1",
    "apiFunc2 end",
    "failed2",
  ]);

  done();
});

test("2b 1x2x", async (done) => {
  // two requests 1, 2, -1x, -2x  (2b 1x2x)
  // note: when first request returns, failedCallback1 is called with second parameter(loading) true
  const callHistory = [];

  const errorMessage1 = "test error 1";
  const mockBeginCallback1 = jest.fn(() => callHistory.push("begin1"));
  const mockSuccessCallback1 = jest.fn(() => callHistory.push("success1"));
  const mockFailedCallback1 = jest.fn(() => callHistory.push("failed1"));

  const mockApiFunctionAsync1 = jest.fn(async () => {
    callHistory.push("apiFunc1 start");
    try {
      await wait(100);
      throw new Error(errorMessage1);
    }
    finally {
      callHistory.push("apiFunc1 end");
    }
  });

  const errorMessage2 = "test error 1";
  const mockBeginCallback2 = jest.fn(() => callHistory.push("begin2"));
  const mockSuccessCallback2 = jest.fn(() => callHistory.push("success2"));
  const mockFailedCallback2 = jest.fn(() => callHistory.push("failed2"));

  const mockApiFunctionAsync2 = jest.fn(async () => {
    callHistory.push("apiFunc2 start");
    try {
      await wait(200);
      throw new Error(errorMessage2);
    }
    finally {
      callHistory.push("apiFunc2 end");
    }
  });

  const requestScope = createRequestScope();
  const request1 = requestScope.getRequest(
    mockBeginCallback1,
    mockSuccessCallback1,
    mockFailedCallback1
  );

  const request2 = requestScope.getRequest(
    mockBeginCallback2,
    mockSuccessCallback2,
    mockFailedCallback2
  );
  await Promise.all([
    request1(mockApiFunctionAsync1),
    request2(mockApiFunctionAsync2)
  ]);

  expect(mockBeginCallback1).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback1).toHaveBeenCalledWith();

  expect(mockApiFunctionAsync1).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync1).toHaveBeenCalledWith();

  expect(mockBeginCallback2).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback2).toHaveBeenCalledWith();

  expect(mockApiFunctionAsync2).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync2).toHaveBeenCalledWith();

  expect(mockFailedCallback1).toHaveBeenCalledTimes(1);
  expect(mockFailedCallback1.mock.calls[0].length).toBe(2); // two arguments
  expect(mockFailedCallback1.mock.calls[0][0].message).toBe(errorMessage1);
  expect(mockFailedCallback1.mock.calls[0][1]).toBe(true); // loading

  expect(mockFailedCallback2).toHaveBeenCalledTimes(1);
  expect(mockFailedCallback2.mock.calls[0].length).toBe(2); // two arguments
  expect(mockFailedCallback2.mock.calls[0][0].message).toBe(errorMessage2);
  expect(mockFailedCallback2.mock.calls[0][1]).toBe(false);

  expect(mockSuccessCallback1).not.toHaveBeenCalled();

  expect(mockSuccessCallback2).not.toHaveBeenCalled();

  expect(callHistory).toEqual([
    "begin1",
    "apiFunc1 start",
    "begin2",
    "apiFunc2 start",
    "apiFunc1 end",
    "failed1",
    "apiFunc2 end",
    "failed2",
  ]);

  done();
});

test("2c 1x", async (done) => {
  // two requests 1, 2, -2, -1x (2c 1x)
  const callHistory = [];

  const errorMessage1 = "test error 1";
  const mockBeginCallback1 = jest.fn(() => callHistory.push("begin1"));
  const mockSuccessCallback1 = jest.fn(() => callHistory.push("success1"));
  const mockFailedCallback1 = jest.fn(() => callHistory.push("failed1"));

  const mockApiFunctionAsync1 = jest.fn(async () => {
    callHistory.push("apiFunc1 start");
    try {
      await wait(200);
      throw new Error(errorMessage1);
    }
    finally {
      callHistory.push("apiFunc1 end");
    }
  });

  const apiData2 = { data: "api response data 2" };
  const mockBeginCallback2 = jest.fn(() => callHistory.push("begin2"));
  const mockSuccessCallback2 = jest.fn(() => callHistory.push("success2"));
  const mockFailedCallback2 = jest.fn(() => callHistory.push("failed2"));

  const mockApiFunctionAsync2 = jest.fn(async () => {
    callHistory.push("apiFunc2 start");
    try {
      await wait(100);
      return apiData2;
    }
    finally {
      callHistory.push("apiFunc2 end");
    }
  });

  const requestScope = createRequestScope();
  const request1 = requestScope.getRequest(
    mockBeginCallback1,
    mockSuccessCallback1,
    mockFailedCallback1
  );

  const request2 = requestScope.getRequest(
    mockBeginCallback2,
    mockSuccessCallback2,
    mockFailedCallback2
  );
  await Promise.all([
    request1(mockApiFunctionAsync1),
    request2(mockApiFunctionAsync2)
  ]);

  expect(mockBeginCallback1).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback1).toHaveBeenCalledWith();

  expect(mockApiFunctionAsync1).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync1).toHaveBeenCalledWith();

  expect(mockBeginCallback2).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback2).toHaveBeenCalledWith();

  expect(mockApiFunctionAsync2).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync2).toHaveBeenCalledWith();

  expect(mockSuccessCallback2).toHaveBeenCalledTimes(1);
  expect(mockSuccessCallback2).toHaveBeenCalledWith(apiData2, false);

  expect(mockSuccessCallback1).not.toHaveBeenCalled();

  expect(mockFailedCallback1).not.toHaveBeenCalled();

  expect(mockFailedCallback2).not.toHaveBeenCalled();

  expect(callHistory).toEqual([
    "begin1",
    "apiFunc1 start",
    "begin2",
    "apiFunc2 start",
    "apiFunc2 end",
    "success2",
    "apiFunc1 end"
  ]);

  done();
});

test("2c 2x", async (done) => {
  // two requests 1, 2, -2x, -1 (2c 2x)
  const callHistory = [];

  const apiData1 = { data: "api response data 1" };
  const mockBeginCallback1 = jest.fn(() => callHistory.push("begin1"));
  const mockSuccessCallback1 = jest.fn(() => callHistory.push("success1"));
  const mockFailedCallback1 = jest.fn(() => callHistory.push("failed1"));

  const mockApiFunctionAsync1 = jest.fn(async () => {
    callHistory.push("apiFunc1 start");
    try {
      await wait(200);
      return apiData1;
    }
    finally {
      callHistory.push("apiFunc1 end");
    }
  });

  const errorMessage2 = "test error 2";
  const mockBeginCallback2 = jest.fn(() => callHistory.push("begin2"));
  const mockSuccessCallback2 = jest.fn(() => callHistory.push("success2"));
  const mockFailedCallback2 = jest.fn(() => callHistory.push("failed2"));

  const mockApiFunctionAsync2 = jest.fn(async () => {
    callHistory.push("apiFunc2 start");
    try {
      await wait(100);
      throw new Error(errorMessage2);
    }
    finally {
      callHistory.push("apiFunc2 end");
    }
  });

  const requestScope = createRequestScope();
  const request1 = requestScope.getRequest(
    mockBeginCallback1,
    mockSuccessCallback1,
    mockFailedCallback1
  );

  const request2 = requestScope.getRequest(
    mockBeginCallback2,
    mockSuccessCallback2,
    mockFailedCallback2
  );
  await Promise.all([
    request1(mockApiFunctionAsync1),
    request2(mockApiFunctionAsync2)
  ]);

  expect(mockBeginCallback1).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback1).toHaveBeenCalledWith();

  expect(mockApiFunctionAsync1).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync1).toHaveBeenCalledWith();

  expect(mockBeginCallback2).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback2).toHaveBeenCalledWith();

  expect(mockApiFunctionAsync2).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync2).toHaveBeenCalledWith();

  expect(mockFailedCallback2).toHaveBeenCalledTimes(1);
  expect(mockFailedCallback2.mock.calls[0].length).toBe(2); // two arguments
  expect(mockFailedCallback2.mock.calls[0][0].message).toBe(errorMessage2);
  expect(mockFailedCallback2.mock.calls[0][1]).toBe(false);

  expect(mockSuccessCallback1).not.toHaveBeenCalled();

  expect(mockFailedCallback1).not.toHaveBeenCalled();

  expect(mockSuccessCallback2).not.toHaveBeenCalled();

  expect(callHistory).toEqual([
    "begin1",
    "apiFunc1 start",
    "begin2",
    "apiFunc2 start",
    "apiFunc2 end",
    "failed2",
    "apiFunc1 end"
  ]);

  done();
});

test("2c 1x2x", async (done) => {
  // two requests 1, 2, -2x, -1x (2c 1x2x)
  const callHistory = [];

  const errorMessage1 = "test error 1";
  const mockBeginCallback1 = jest.fn(() => callHistory.push("begin1"));
  const mockSuccessCallback1 = jest.fn(() => callHistory.push("success1"));
  const mockFailedCallback1 = jest.fn(() => callHistory.push("failed1"));

  const mockApiFunctionAsync1 = jest.fn(async () => {
    callHistory.push("apiFunc1 start");
    try {
      await wait(200);
      throw new Error(errorMessage1);
    }
    finally {
      callHistory.push("apiFunc1 end");
    }
  });

  const errorMessage2 = "test error 2";
  const mockBeginCallback2 = jest.fn(() => callHistory.push("begin2"));
  const mockSuccessCallback2 = jest.fn(() => callHistory.push("success2"));
  const mockFailedCallback2 = jest.fn(() => callHistory.push("failed2"));

  const mockApiFunctionAsync2 = jest.fn(async () => {
    callHistory.push("apiFunc2 start");
    try {
      await wait(100);
      throw new Error(errorMessage2);
    }
    finally {
      callHistory.push("apiFunc2 end");
    }
  });

  const requestScope = createRequestScope();
  const request1 = requestScope.getRequest(
    mockBeginCallback1,
    mockSuccessCallback1,
    mockFailedCallback1
  );

  const request2 = requestScope.getRequest(
    mockBeginCallback2,
    mockSuccessCallback2,
    mockFailedCallback2
  );
  await Promise.all([
    request1(mockApiFunctionAsync1),
    request2(mockApiFunctionAsync2)
  ]);

  expect(mockBeginCallback1).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback1).toHaveBeenCalledWith();

  expect(mockApiFunctionAsync1).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync1).toHaveBeenCalledWith();

  expect(mockBeginCallback2).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback2).toHaveBeenCalledWith();

  expect(mockApiFunctionAsync2).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync2).toHaveBeenCalledWith();

  expect(mockFailedCallback2).toHaveBeenCalledTimes(1);
  expect(mockFailedCallback2.mock.calls[0].length).toBe(2); // two arguments
  expect(mockFailedCallback2.mock.calls[0][0].message).toBe(errorMessage2);
  expect(mockFailedCallback2.mock.calls[0][1]).toBe(false);

  expect(mockSuccessCallback1).not.toHaveBeenCalled();

  expect(mockFailedCallback1).not.toHaveBeenCalled();

  expect(mockSuccessCallback2).not.toHaveBeenCalled();

  expect(callHistory).toEqual([
    "begin1",
    "apiFunc1 start",
    "begin2",
    "apiFunc2 start",
    "apiFunc2 end",
    "failed2",
    "apiFunc1 end"
  ]);

  done();
});
//#endregion two requests

//#region three requests
// By assumeing a completed (1, -1) will have no effect on later requests. Three requests would cover all use cases(?)
// The following tests will have requests 1,2,3 started, then each test name represents the order of response.
// - three requests: different order response: (1,2,3), (1,3,2), (2,1,3), (2,3,1), (3,1,2), (3,2,1)
// - three requests: different order response: with some fails (last fail): (1,2,3x), (3x,1,2), (3x,1,2x)
// - three requests: different order response: with some fails (non-last fail): (1,2x,3), (1,3,2x)

//#region three successful requests
test("(1,2,3)", async (done) => {
  // three requests 1, 2, 3, -1, -2, -3
  const callHistory = [];

  const apiData1 = { data: "api response data 1" };
  const mockBeginCallback1 = jest.fn(() => callHistory.push("begin1"));
  const mockSuccessCallback1 = jest.fn(() => callHistory.push("success1"));
  const mockFailedCallback1 = jest.fn(() => callHistory.push("failed1"));

  const mockApiFunctionAsync1 = jest.fn(async () => {
    callHistory.push("apiFunc1 start");
    try {
      await wait(10);
      return apiData1;
    }
    finally {
      callHistory.push("apiFunc1 end");
    }
  });

  const apiData2 = { data: "api response data 2" };
  const mockBeginCallback2 = jest.fn(() => callHistory.push("begin2"));
  const mockSuccessCallback2 = jest.fn(() => callHistory.push("success2"));
  const mockFailedCallback2 = jest.fn(() => callHistory.push("failed2"));

  const mockApiFunctionAsync2 = jest.fn(async () => {
    callHistory.push("apiFunc2 start");
    try {
      await wait(100);
      return apiData2;
    }
    finally {
      callHistory.push("apiFunc2 end");
    }
  });

  const apiData3 = { data: "api response data 3" };
  const mockBeginCallback3 = jest.fn(() => callHistory.push("begin3"));
  const mockSuccessCallback3 = jest.fn(() => callHistory.push("success3"));
  const mockFailedCallback3 = jest.fn(() => callHistory.push("failed3"));

  const mockApiFunctionAsync3 = jest.fn(async () => {
    callHistory.push("apiFunc3 start");
    try {
      await wait(200);
      return apiData3;
    }
    finally {
      callHistory.push("apiFunc3 end");
    }
  });

  const requestScope = createRequestScope();
  const request1 = requestScope.getRequest(
    mockBeginCallback1,
    mockSuccessCallback1,
    mockFailedCallback1
  );
  const request2 = requestScope.getRequest(
    mockBeginCallback2,
    mockSuccessCallback2,
    mockFailedCallback2
  );
  const request3 = requestScope.getRequest(
    mockBeginCallback3,
    mockSuccessCallback3,
    mockFailedCallback3
  );
  await Promise.all([
    request1(mockApiFunctionAsync1),
    request2(mockApiFunctionAsync2),
    request3(mockApiFunctionAsync3)
  ]);

  expect(mockBeginCallback1).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback1).toHaveBeenCalledWith();
  expect(mockApiFunctionAsync1).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync1).toHaveBeenCalledWith();

  expect(mockBeginCallback2).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback2).toHaveBeenCalledWith();
  expect(mockApiFunctionAsync2).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync2).toHaveBeenCalledWith();

  expect(mockBeginCallback3).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback3).toHaveBeenCalledWith();
  expect(mockApiFunctionAsync3).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync3).toHaveBeenCalledWith();

  expect(mockSuccessCallback1).toHaveBeenCalledTimes(1);
  expect(mockSuccessCallback1).toHaveBeenCalledWith(apiData1, true); // loading

  expect(mockSuccessCallback2).toHaveBeenCalledTimes(1);
  expect(mockSuccessCallback2).toHaveBeenCalledWith(apiData2, true); // loading

  expect(mockSuccessCallback3).toHaveBeenCalledTimes(1);
  expect(mockSuccessCallback3).toHaveBeenCalledWith(apiData3, false);

  expect(mockFailedCallback1).not.toHaveBeenCalled();

  expect(mockFailedCallback2).not.toHaveBeenCalled();

  expect(mockFailedCallback3).not.toHaveBeenCalled();

  expect(callHistory).toEqual([
    "begin1",
    "apiFunc1 start",
    "begin2",
    "apiFunc2 start",
    "begin3",
    "apiFunc3 start",
    "apiFunc1 end",
    "success1",
    "apiFunc2 end",
    "success2",
    "apiFunc3 end",
    "success3",
  ]);

  done();
});

test("(1,3,2)", async (done) => {
  // three requests 1, 2, 3, -1, -3, -2
  const callHistory = [];

  const apiData1 = { data: "api response data 1" };
  const mockBeginCallback1 = jest.fn(() => callHistory.push("begin1"));
  const mockSuccessCallback1 = jest.fn(() => callHistory.push("success1"));
  const mockFailedCallback1 = jest.fn(() => callHistory.push("failed1"));

  const mockApiFunctionAsync1 = jest.fn(async () => {
    callHistory.push("apiFunc1 start");
    try {
      await wait(10);
      return apiData1;
    }
    finally {
      callHistory.push("apiFunc1 end");
    }
  });

  const apiData2 = { data: "api response data 2" };
  const mockBeginCallback2 = jest.fn(() => callHistory.push("begin2"));
  const mockSuccessCallback2 = jest.fn(() => callHistory.push("success2"));
  const mockFailedCallback2 = jest.fn(() => callHistory.push("failed2"));

  const mockApiFunctionAsync2 = jest.fn(async () => {
    callHistory.push("apiFunc2 start");
    try {
      await wait(200);
      return apiData2;
    }
    finally {
      callHistory.push("apiFunc2 end");
    }
  });

  const apiData3 = { data: "api response data 3" };
  const mockBeginCallback3 = jest.fn(() => callHistory.push("begin3"));
  const mockSuccessCallback3 = jest.fn(() => callHistory.push("success3"));
  const mockFailedCallback3 = jest.fn(() => callHistory.push("failed3"));

  const mockApiFunctionAsync3 = jest.fn(async () => {
    callHistory.push("apiFunc3 start");
    try {
      await wait(100);
      return apiData3;
    }
    finally {
      callHistory.push("apiFunc3 end");
    }
  });

  const requestScope = createRequestScope();
  const request1 = requestScope.getRequest(
    mockBeginCallback1,
    mockSuccessCallback1,
    mockFailedCallback1
  );
  const request2 = requestScope.getRequest(
    mockBeginCallback2,
    mockSuccessCallback2,
    mockFailedCallback2
  );
  const request3 = requestScope.getRequest(
    mockBeginCallback3,
    mockSuccessCallback3,
    mockFailedCallback3
  );
  await Promise.all([
    request1(mockApiFunctionAsync1),
    request2(mockApiFunctionAsync2),
    request3(mockApiFunctionAsync3)
  ]);

  expect(mockBeginCallback1).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback1).toHaveBeenCalledWith();
  expect(mockApiFunctionAsync1).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync1).toHaveBeenCalledWith();

  expect(mockBeginCallback2).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback2).toHaveBeenCalledWith();
  expect(mockApiFunctionAsync2).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync2).toHaveBeenCalledWith();

  expect(mockBeginCallback3).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback3).toHaveBeenCalledWith();
  expect(mockApiFunctionAsync3).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync3).toHaveBeenCalledWith();

  expect(mockSuccessCallback1).toHaveBeenCalledTimes(1);
  expect(mockSuccessCallback1).toHaveBeenCalledWith(apiData1, true); // loading

  expect(mockSuccessCallback3).toHaveBeenCalledTimes(1);
  expect(mockSuccessCallback3).toHaveBeenCalledWith(apiData3, false);

  expect(mockSuccessCallback2).not.toHaveBeenCalled();

  expect(mockFailedCallback1).not.toHaveBeenCalled();

  expect(mockFailedCallback2).not.toHaveBeenCalled();

  expect(mockFailedCallback3).not.toHaveBeenCalled();

  expect(callHistory).toEqual([
    "begin1",
    "apiFunc1 start",
    "begin2",
    "apiFunc2 start",
    "begin3",
    "apiFunc3 start",
    "apiFunc1 end",
    "success1",
    "apiFunc3 end",
    "success3",
    "apiFunc2 end",
  ]);

  done();
});

test("(2,1,3)", async (done) => {
  // three requests 1, 2, 3, -2, -1, -3
  const callHistory = [];

  const apiData1 = { data: "api response data 1" };
  const mockBeginCallback1 = jest.fn(() => callHistory.push("begin1"));
  const mockSuccessCallback1 = jest.fn(() => callHistory.push("success1"));
  const mockFailedCallback1 = jest.fn(() => callHistory.push("failed1"));

  const mockApiFunctionAsync1 = jest.fn(async () => {
    callHistory.push("apiFunc1 start");
    try {
      await wait(100);
      return apiData1;
    }
    finally {
      callHistory.push("apiFunc1 end");
    }
  });

  const apiData2 = { data: "api response data 2" };
  const mockBeginCallback2 = jest.fn(() => callHistory.push("begin2"));
  const mockSuccessCallback2 = jest.fn(() => callHistory.push("success2"));
  const mockFailedCallback2 = jest.fn(() => callHistory.push("failed2"));

  const mockApiFunctionAsync2 = jest.fn(async () => {
    callHistory.push("apiFunc2 start");
    try {
      await wait(10);
      return apiData2;
    }
    finally {
      callHistory.push("apiFunc2 end");
    }
  });

  const apiData3 = { data: "api response data 3" };
  const mockBeginCallback3 = jest.fn(() => callHistory.push("begin3"));
  const mockSuccessCallback3 = jest.fn(() => callHistory.push("success3"));
  const mockFailedCallback3 = jest.fn(() => callHistory.push("failed3"));

  const mockApiFunctionAsync3 = jest.fn(async () => {
    callHistory.push("apiFunc3 start");
    try {
      await wait(200);
      return apiData3;
    }
    finally {
      callHistory.push("apiFunc3 end");
    }
  });

  const requestScope = createRequestScope();
  const request1 = requestScope.getRequest(
    mockBeginCallback1,
    mockSuccessCallback1,
    mockFailedCallback1
  );
  const request2 = requestScope.getRequest(
    mockBeginCallback2,
    mockSuccessCallback2,
    mockFailedCallback2
  );
  const request3 = requestScope.getRequest(
    mockBeginCallback3,
    mockSuccessCallback3,
    mockFailedCallback3
  );
  await Promise.all([
    request1(mockApiFunctionAsync1),
    request2(mockApiFunctionAsync2),
    request3(mockApiFunctionAsync3)
  ]);

  expect(mockBeginCallback1).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback1).toHaveBeenCalledWith();
  expect(mockApiFunctionAsync1).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync1).toHaveBeenCalledWith();

  expect(mockBeginCallback2).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback2).toHaveBeenCalledWith();
  expect(mockApiFunctionAsync2).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync2).toHaveBeenCalledWith();

  expect(mockBeginCallback3).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback3).toHaveBeenCalledWith();
  expect(mockApiFunctionAsync3).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync3).toHaveBeenCalledWith();

  expect(mockSuccessCallback2).toHaveBeenCalledTimes(1);
  expect(mockSuccessCallback2).toHaveBeenCalledWith(apiData2, true); // loading

  expect(mockSuccessCallback3).toHaveBeenCalledTimes(1);
  expect(mockSuccessCallback3).toHaveBeenCalledWith(apiData3, false);

  expect(mockSuccessCallback1).not.toHaveBeenCalled();

  expect(mockFailedCallback1).not.toHaveBeenCalled();

  expect(mockFailedCallback2).not.toHaveBeenCalled();

  expect(mockFailedCallback3).not.toHaveBeenCalled();

  expect(callHistory).toEqual([
    "begin1",
    "apiFunc1 start",
    "begin2",
    "apiFunc2 start",
    "begin3",
    "apiFunc3 start",
    "apiFunc2 end",
    "success2",
    "apiFunc1 end",
    "apiFunc3 end",
    "success3",
  ]);

  done();
});

test("(2,3,1)", async (done) => {
  // three requests 1, 2, 3, -2, -3, -1
  const callHistory = [];

  const apiData1 = { data: "api response data 1" };
  const mockBeginCallback1 = jest.fn(() => callHistory.push("begin1"));
  const mockSuccessCallback1 = jest.fn(() => callHistory.push("success1"));
  const mockFailedCallback1 = jest.fn(() => callHistory.push("failed1"));

  const mockApiFunctionAsync1 = jest.fn(async () => {
    callHistory.push("apiFunc1 start");
    try {
      await wait(200);
      return apiData1;
    }
    finally {
      callHistory.push("apiFunc1 end");
    }
  });

  const apiData2 = { data: "api response data 2" };
  const mockBeginCallback2 = jest.fn(() => callHistory.push("begin2"));
  const mockSuccessCallback2 = jest.fn(() => callHistory.push("success2"));
  const mockFailedCallback2 = jest.fn(() => callHistory.push("failed2"));

  const mockApiFunctionAsync2 = jest.fn(async () => {
    callHistory.push("apiFunc2 start");
    try {
      await wait(10);
      return apiData2;
    }
    finally {
      callHistory.push("apiFunc2 end");
    }
  });

  const apiData3 = { data: "api response data 3" };
  const mockBeginCallback3 = jest.fn(() => callHistory.push("begin3"));
  const mockSuccessCallback3 = jest.fn(() => callHistory.push("success3"));
  const mockFailedCallback3 = jest.fn(() => callHistory.push("failed3"));

  const mockApiFunctionAsync3 = jest.fn(async () => {
    callHistory.push("apiFunc3 start");
    try {
      await wait(100);
      return apiData3;
    }
    finally {
      callHistory.push("apiFunc3 end");
    }
  });

  const requestScope = createRequestScope();
  const request1 = requestScope.getRequest(
    mockBeginCallback1,
    mockSuccessCallback1,
    mockFailedCallback1
  );
  const request2 = requestScope.getRequest(
    mockBeginCallback2,
    mockSuccessCallback2,
    mockFailedCallback2
  );
  const request3 = requestScope.getRequest(
    mockBeginCallback3,
    mockSuccessCallback3,
    mockFailedCallback3
  );
  await Promise.all([
    request1(mockApiFunctionAsync1),
    request2(mockApiFunctionAsync2),
    request3(mockApiFunctionAsync3)
  ]);

  expect(mockBeginCallback1).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback1).toHaveBeenCalledWith();
  expect(mockApiFunctionAsync1).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync1).toHaveBeenCalledWith();

  expect(mockBeginCallback2).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback2).toHaveBeenCalledWith();
  expect(mockApiFunctionAsync2).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync2).toHaveBeenCalledWith();

  expect(mockBeginCallback3).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback3).toHaveBeenCalledWith();
  expect(mockApiFunctionAsync3).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync3).toHaveBeenCalledWith();

  expect(mockSuccessCallback2).toHaveBeenCalledTimes(1);
  expect(mockSuccessCallback2).toHaveBeenCalledWith(apiData2, true); // loading

  expect(mockSuccessCallback3).toHaveBeenCalledTimes(1);
  expect(mockSuccessCallback3).toHaveBeenCalledWith(apiData3, false);

  expect(mockSuccessCallback1).not.toHaveBeenCalled();

  expect(mockFailedCallback1).not.toHaveBeenCalled();

  expect(mockFailedCallback2).not.toHaveBeenCalled();

  expect(mockFailedCallback3).not.toHaveBeenCalled();

  expect(callHistory).toEqual([
    "begin1",
    "apiFunc1 start",
    "begin2",
    "apiFunc2 start",
    "begin3",
    "apiFunc3 start",
    "apiFunc2 end",
    "success2",
    "apiFunc3 end",
    "success3",
    "apiFunc1 end",
  ]);

  done();
});

test("(3,1,2)", async (done) => {
  // three requests 1, 2, 3, -3, -1, -2
  const callHistory = [];

  const apiData1 = { data: "api response data 1" };
  const mockBeginCallback1 = jest.fn(() => callHistory.push("begin1"));
  const mockSuccessCallback1 = jest.fn(() => callHistory.push("success1"));
  const mockFailedCallback1 = jest.fn(() => callHistory.push("failed1"));

  const mockApiFunctionAsync1 = jest.fn(async () => {
    callHistory.push("apiFunc1 start");
    try {
      await wait(100);
      return apiData1;
    }
    finally {
      callHistory.push("apiFunc1 end");
    }
  });

  const apiData2 = { data: "api response data 2" };
  const mockBeginCallback2 = jest.fn(() => callHistory.push("begin2"));
  const mockSuccessCallback2 = jest.fn(() => callHistory.push("success2"));
  const mockFailedCallback2 = jest.fn(() => callHistory.push("failed2"));

  const mockApiFunctionAsync2 = jest.fn(async () => {
    callHistory.push("apiFunc2 start");
    try {
      await wait(200);
      return apiData2;
    }
    finally {
      callHistory.push("apiFunc2 end");
    }
  });

  const apiData3 = { data: "api response data 3" };
  const mockBeginCallback3 = jest.fn(() => callHistory.push("begin3"));
  const mockSuccessCallback3 = jest.fn(() => callHistory.push("success3"));
  const mockFailedCallback3 = jest.fn(() => callHistory.push("failed3"));

  const mockApiFunctionAsync3 = jest.fn(async () => {
    callHistory.push("apiFunc3 start");
    try {
      await wait(10);
      return apiData3;
    }
    finally {
      callHistory.push("apiFunc3 end");
    }
  });

  const requestScope = createRequestScope();
  const request1 = requestScope.getRequest(
    mockBeginCallback1,
    mockSuccessCallback1,
    mockFailedCallback1
  );
  const request2 = requestScope.getRequest(
    mockBeginCallback2,
    mockSuccessCallback2,
    mockFailedCallback2
  );
  const request3 = requestScope.getRequest(
    mockBeginCallback3,
    mockSuccessCallback3,
    mockFailedCallback3
  );
  await Promise.all([
    request1(mockApiFunctionAsync1),
    request2(mockApiFunctionAsync2),
    request3(mockApiFunctionAsync3)
  ]);

  expect(mockBeginCallback1).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback1).toHaveBeenCalledWith();
  expect(mockApiFunctionAsync1).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync1).toHaveBeenCalledWith();

  expect(mockBeginCallback2).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback2).toHaveBeenCalledWith();
  expect(mockApiFunctionAsync2).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync2).toHaveBeenCalledWith();

  expect(mockBeginCallback3).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback3).toHaveBeenCalledWith();
  expect(mockApiFunctionAsync3).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync3).toHaveBeenCalledWith();

  expect(mockSuccessCallback3).toHaveBeenCalledTimes(1);
  expect(mockSuccessCallback3).toHaveBeenCalledWith(apiData3, false);

  expect(mockSuccessCallback1).not.toHaveBeenCalled();

  expect(mockSuccessCallback2).not.toHaveBeenCalled();

  expect(mockFailedCallback1).not.toHaveBeenCalled();

  expect(mockFailedCallback2).not.toHaveBeenCalled();

  expect(mockFailedCallback3).not.toHaveBeenCalled();

  expect(callHistory).toEqual([
    "begin1",
    "apiFunc1 start",
    "begin2",
    "apiFunc2 start",
    "begin3",
    "apiFunc3 start",
    "apiFunc3 end",
    "success3",
    "apiFunc1 end",
    "apiFunc2 end",
  ]);

  done();
});

test("(3,2,1)", async (done) => {
  // three requests 1, 2, 3, -3, -2, -1
  const callHistory = [];

  const apiData1 = { data: "api response data 1" };
  const mockBeginCallback1 = jest.fn(() => callHistory.push("begin1"));
  const mockSuccessCallback1 = jest.fn(() => callHistory.push("success1"));
  const mockFailedCallback1 = jest.fn(() => callHistory.push("failed1"));

  const mockApiFunctionAsync1 = jest.fn(async () => {
    callHistory.push("apiFunc1 start");
    try {
      await wait(200);
      return apiData1;
    }
    finally {
      callHistory.push("apiFunc1 end");
    }
  });

  const apiData2 = { data: "api response data 2" };
  const mockBeginCallback2 = jest.fn(() => callHistory.push("begin2"));
  const mockSuccessCallback2 = jest.fn(() => callHistory.push("success2"));
  const mockFailedCallback2 = jest.fn(() => callHistory.push("failed2"));

  const mockApiFunctionAsync2 = jest.fn(async () => {
    callHistory.push("apiFunc2 start");
    try {
      await wait(100);
      return apiData2;
    }
    finally {
      callHistory.push("apiFunc2 end");
    }
  });

  const apiData3 = { data: "api response data 3" };
  const mockBeginCallback3 = jest.fn(() => callHistory.push("begin3"));
  const mockSuccessCallback3 = jest.fn(() => callHistory.push("success3"));
  const mockFailedCallback3 = jest.fn(() => callHistory.push("failed3"));

  const mockApiFunctionAsync3 = jest.fn(async () => {
    callHistory.push("apiFunc3 start");
    try {
      await wait(10);
      return apiData3;
    }
    finally {
      callHistory.push("apiFunc3 end");
    }
  });

  const requestScope = createRequestScope();
  const request1 = requestScope.getRequest(
    mockBeginCallback1,
    mockSuccessCallback1,
    mockFailedCallback1
  );
  const request2 = requestScope.getRequest(
    mockBeginCallback2,
    mockSuccessCallback2,
    mockFailedCallback2
  );
  const request3 = requestScope.getRequest(
    mockBeginCallback3,
    mockSuccessCallback3,
    mockFailedCallback3
  );
  await Promise.all([
    request1(mockApiFunctionAsync1),
    request2(mockApiFunctionAsync2),
    request3(mockApiFunctionAsync3)
  ]);

  expect(mockBeginCallback1).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback1).toHaveBeenCalledWith();
  expect(mockApiFunctionAsync1).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync1).toHaveBeenCalledWith();

  expect(mockBeginCallback2).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback2).toHaveBeenCalledWith();
  expect(mockApiFunctionAsync2).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync2).toHaveBeenCalledWith();

  expect(mockBeginCallback3).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback3).toHaveBeenCalledWith();
  expect(mockApiFunctionAsync3).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync3).toHaveBeenCalledWith();

  expect(mockSuccessCallback3).toHaveBeenCalledTimes(1);
  expect(mockSuccessCallback3).toHaveBeenCalledWith(apiData3, false);

  expect(mockSuccessCallback1).not.toHaveBeenCalled();

  expect(mockSuccessCallback2).not.toHaveBeenCalled();

  expect(mockFailedCallback1).not.toHaveBeenCalled();

  expect(mockFailedCallback2).not.toHaveBeenCalled();

  expect(mockFailedCallback3).not.toHaveBeenCalled();

  expect(callHistory).toEqual([
    "begin1",
    "apiFunc1 start",
    "begin2",
    "apiFunc2 start",
    "begin3",
    "apiFunc3 start",
    "apiFunc3 end",
    "success3",
    "apiFunc2 end",
    "apiFunc1 end",
  ]);

  done();
});
//#endregion three successful requests

//#region three requests with last fail 
test("(1,2,3x)", async (done) => {
  // three requests 1, 2, 3, -1, -2, -3x
  const callHistory = [];

  const apiData1 = { data: "api response data 1" };
  const mockBeginCallback1 = jest.fn(() => callHistory.push("begin1"));
  const mockSuccessCallback1 = jest.fn(() => callHistory.push("success1"));
  const mockFailedCallback1 = jest.fn(() => callHistory.push("failed1"));

  const mockApiFunctionAsync1 = jest.fn(async () => {
    callHistory.push("apiFunc1 start");
    try {
      await wait(10);
      return apiData1;
    }
    finally {
      callHistory.push("apiFunc1 end");
    }
  });

  const apiData2 = { data: "api response data 2" };
  const mockBeginCallback2 = jest.fn(() => callHistory.push("begin2"));
  const mockSuccessCallback2 = jest.fn(() => callHistory.push("success2"));
  const mockFailedCallback2 = jest.fn(() => callHistory.push("failed2"));

  const mockApiFunctionAsync2 = jest.fn(async () => {
    callHistory.push("apiFunc2 start");
    try {
      await wait(100);
      return apiData2;
    }
    finally {
      callHistory.push("apiFunc2 end");
    }
  });

  const errorMessage3 = "test error 3";
  const mockBeginCallback3 = jest.fn(() => callHistory.push("begin3"));
  const mockSuccessCallback3 = jest.fn(() => callHistory.push("success3"));
  const mockFailedCallback3 = jest.fn(() => callHistory.push("failed3"));

  const mockApiFunctionAsync3 = jest.fn(async () => {
    callHistory.push("apiFunc3 start");
    try {
      await wait(200);
      throw new Error(errorMessage3);
    }
    finally {
      callHistory.push("apiFunc3 end");
    }
  });

  const requestScope = createRequestScope();
  const request1 = requestScope.getRequest(
    mockBeginCallback1,
    mockSuccessCallback1,
    mockFailedCallback1
  );
  const request2 = requestScope.getRequest(
    mockBeginCallback2,
    mockSuccessCallback2,
    mockFailedCallback2
  );
  const request3 = requestScope.getRequest(
    mockBeginCallback3,
    mockSuccessCallback3,
    mockFailedCallback3
  );
  await Promise.all([
    request1(mockApiFunctionAsync1),
    request2(mockApiFunctionAsync2),
    request3(mockApiFunctionAsync3)
  ]);

  expect(mockBeginCallback1).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback1).toHaveBeenCalledWith();
  expect(mockApiFunctionAsync1).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync1).toHaveBeenCalledWith();

  expect(mockBeginCallback2).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback2).toHaveBeenCalledWith();
  expect(mockApiFunctionAsync2).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync2).toHaveBeenCalledWith();

  expect(mockBeginCallback3).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback3).toHaveBeenCalledWith();
  expect(mockApiFunctionAsync3).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync3).toHaveBeenCalledWith();

  expect(mockSuccessCallback1).toHaveBeenCalledTimes(1);
  expect(mockSuccessCallback1).toHaveBeenCalledWith(apiData1, true); // loading

  expect(mockSuccessCallback2).toHaveBeenCalledTimes(1);
  expect(mockSuccessCallback2).toHaveBeenCalledWith(apiData2, true); // loading

  expect(mockFailedCallback3).toHaveBeenCalledTimes(1);
  expect(mockFailedCallback3.mock.calls[0].length).toBe(2); // two arguments
  expect(mockFailedCallback3.mock.calls[0][0].message).toBe(errorMessage3);
  expect(mockFailedCallback3.mock.calls[0][1]).toBe(false);

  expect(mockFailedCallback1).not.toHaveBeenCalled();

  expect(mockFailedCallback2).not.toHaveBeenCalled();

  expect(mockSuccessCallback3).not.toHaveBeenCalled();

  expect(callHistory).toEqual([
    "begin1",
    "apiFunc1 start",
    "begin2",
    "apiFunc2 start",
    "begin3",
    "apiFunc3 start",
    "apiFunc1 end",
    "success1",
    "apiFunc2 end",
    "success2",
    "apiFunc3 end",
    "failed3",
  ]);

  done();
});

test("(3x,1,2)", async (done) => {
  // three requests 1, 2, 3, -3x, -1, -2
  const callHistory = [];

  const apiData1 = { data: "api response data 1" };
  const mockBeginCallback1 = jest.fn(() => callHistory.push("begin1"));
  const mockSuccessCallback1 = jest.fn(() => callHistory.push("success1"));
  const mockFailedCallback1 = jest.fn(() => callHistory.push("failed1"));

  const mockApiFunctionAsync1 = jest.fn(async () => {
    callHistory.push("apiFunc1 start");
    try {
      await wait(100);
      return apiData1;
    }
    finally {
      callHistory.push("apiFunc1 end");
    }
  });

  const apiData2 = { data: "api response data 2" };
  const mockBeginCallback2 = jest.fn(() => callHistory.push("begin2"));
  const mockSuccessCallback2 = jest.fn(() => callHistory.push("success2"));
  const mockFailedCallback2 = jest.fn(() => callHistory.push("failed2"));

  const mockApiFunctionAsync2 = jest.fn(async () => {
    callHistory.push("apiFunc2 start");
    try {
      await wait(200);
      return apiData2;
    }
    finally {
      callHistory.push("apiFunc2 end");
    }
  });

  const errorMessage3 = "test error 3";
  const mockBeginCallback3 = jest.fn(() => callHistory.push("begin3"));
  const mockSuccessCallback3 = jest.fn(() => callHistory.push("success3"));
  const mockFailedCallback3 = jest.fn(() => callHistory.push("failed3"));

  const mockApiFunctionAsync3 = jest.fn(async () => {
    callHistory.push("apiFunc3 start");
    try {
      await wait(10);
      throw new Error(errorMessage3);
    }
    finally {
      callHistory.push("apiFunc3 end");
    }
  });

  const requestScope = createRequestScope();
  const request1 = requestScope.getRequest(
    mockBeginCallback1,
    mockSuccessCallback1,
    mockFailedCallback1
  );
  const request2 = requestScope.getRequest(
    mockBeginCallback2,
    mockSuccessCallback2,
    mockFailedCallback2
  );
  const request3 = requestScope.getRequest(
    mockBeginCallback3,
    mockSuccessCallback3,
    mockFailedCallback3
  );
  await Promise.all([
    request1(mockApiFunctionAsync1),
    request2(mockApiFunctionAsync2),
    request3(mockApiFunctionAsync3)
  ]);

  expect(mockBeginCallback1).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback1).toHaveBeenCalledWith();
  expect(mockApiFunctionAsync1).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync1).toHaveBeenCalledWith();

  expect(mockBeginCallback2).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback2).toHaveBeenCalledWith();
  expect(mockApiFunctionAsync2).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync2).toHaveBeenCalledWith();

  expect(mockBeginCallback3).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback3).toHaveBeenCalledWith();
  expect(mockApiFunctionAsync3).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync3).toHaveBeenCalledWith();

  expect(mockFailedCallback3).toHaveBeenCalledTimes(1);
  expect(mockFailedCallback3.mock.calls[0].length).toBe(2); // two arguments
  expect(mockFailedCallback3.mock.calls[0][0].message).toBe(errorMessage3);
  expect(mockFailedCallback3.mock.calls[0][1]).toBe(false);

  expect(mockSuccessCallback1).not.toHaveBeenCalled();
  expect(mockSuccessCallback2).not.toHaveBeenCalled();
  expect(mockFailedCallback1).not.toHaveBeenCalled();
  expect(mockFailedCallback2).not.toHaveBeenCalled();
  expect(mockSuccessCallback3).not.toHaveBeenCalled();

  expect(callHistory).toEqual([
    "begin1",
    "apiFunc1 start",
    "begin2",
    "apiFunc2 start",
    "begin3",
    "apiFunc3 start",
    "apiFunc3 end",
    "failed3",
    "apiFunc1 end",
    "apiFunc2 end",
  ]);

  done();
});

test("(3x,1,2x)", async (done) => {
  // three requests 1, 2, 3, -3x, -1, -2x
  const callHistory = [];

  const apiData1 = { data: "api response data 1" };
  const mockBeginCallback1 = jest.fn(() => callHistory.push("begin1"));
  const mockSuccessCallback1 = jest.fn(() => callHistory.push("success1"));
  const mockFailedCallback1 = jest.fn(() => callHistory.push("failed1"));

  const mockApiFunctionAsync1 = jest.fn(async () => {
    callHistory.push("apiFunc1 start");
    try {
      await wait(100);
      return apiData1;
    }
    finally {
      callHistory.push("apiFunc1 end");
    }
  });

  const errorMessage2 = "test error 2";
  const mockBeginCallback2 = jest.fn(() => callHistory.push("begin2"));
  const mockSuccessCallback2 = jest.fn(() => callHistory.push("success2"));
  const mockFailedCallback2 = jest.fn(() => callHistory.push("failed2"));

  const mockApiFunctionAsync2 = jest.fn(async () => {
    callHistory.push("apiFunc2 start");
    try {
      await wait(200);
      throw new Error(errorMessage2);
    }
    finally {
      callHistory.push("apiFunc2 end");
    }
  });

  const errorMessage3 = "test error 3";
  const mockBeginCallback3 = jest.fn(() => callHistory.push("begin3"));
  const mockSuccessCallback3 = jest.fn(() => callHistory.push("success3"));
  const mockFailedCallback3 = jest.fn(() => callHistory.push("failed3"));

  const mockApiFunctionAsync3 = jest.fn(async () => {
    callHistory.push("apiFunc3 start");
    try {
      await wait(10);
      throw new Error(errorMessage3);
    }
    finally {
      callHistory.push("apiFunc3 end");
    }
  });

  const requestScope = createRequestScope();
  const request1 = requestScope.getRequest(
    mockBeginCallback1,
    mockSuccessCallback1,
    mockFailedCallback1
  );
  const request2 = requestScope.getRequest(
    mockBeginCallback2,
    mockSuccessCallback2,
    mockFailedCallback2
  );
  const request3 = requestScope.getRequest(
    mockBeginCallback3,
    mockSuccessCallback3,
    mockFailedCallback3
  );
  await Promise.all([
    request1(mockApiFunctionAsync1),
    request2(mockApiFunctionAsync2),
    request3(mockApiFunctionAsync3)
  ]);

  expect(mockBeginCallback1).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback1).toHaveBeenCalledWith();
  expect(mockApiFunctionAsync1).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync1).toHaveBeenCalledWith();

  expect(mockBeginCallback2).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback2).toHaveBeenCalledWith();
  expect(mockApiFunctionAsync2).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync2).toHaveBeenCalledWith();

  expect(mockBeginCallback3).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback3).toHaveBeenCalledWith();
  expect(mockApiFunctionAsync3).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync3).toHaveBeenCalledWith();

  expect(mockFailedCallback3).toHaveBeenCalledTimes(1);
  expect(mockFailedCallback3.mock.calls[0].length).toBe(2); // two arguments
  expect(mockFailedCallback3.mock.calls[0][0].message).toBe(errorMessage3);
  expect(mockFailedCallback3.mock.calls[0][1]).toBe(false);

  expect(mockSuccessCallback1).not.toHaveBeenCalled();
  expect(mockSuccessCallback2).not.toHaveBeenCalled();
  expect(mockFailedCallback1).not.toHaveBeenCalled();
  expect(mockFailedCallback2).not.toHaveBeenCalled();
  expect(mockSuccessCallback3).not.toHaveBeenCalled();

  expect(callHistory).toEqual([
    "begin1",
    "apiFunc1 start",
    "begin2",
    "apiFunc2 start",
    "begin3",
    "apiFunc3 start",
    "apiFunc3 end",
    "failed3",
    "apiFunc1 end",
    "apiFunc2 end",
  ]);

  done();
});
//#endregion three requests with last fail

//#region three requests with non-last fail
test("(1,2x,3)", async (done) => {
  // three requests 1, 2, 3, -1, -2x, -3
  const callHistory = [];

  const apiData1 = { data: "api response data 1" };
  const mockBeginCallback1 = jest.fn(() => callHistory.push("begin1"));
  const mockSuccessCallback1 = jest.fn(() => callHistory.push("success1"));
  const mockFailedCallback1 = jest.fn(() => callHistory.push("failed1"));

  const mockApiFunctionAsync1 = jest.fn(async () => {
    callHistory.push("apiFunc1 start");
    try {
      await wait(10);
      return apiData1;
    }
    finally {
      callHistory.push("apiFunc1 end");
    }
  });

  const errorMessage2 = "test error 2";
  const mockBeginCallback2 = jest.fn(() => callHistory.push("begin2"));
  const mockSuccessCallback2 = jest.fn(() => callHistory.push("success2"));
  const mockFailedCallback2 = jest.fn(() => callHistory.push("failed2"));

  const mockApiFunctionAsync2 = jest.fn(async () => {
    callHistory.push("apiFunc2 start");
    try {
      await wait(100);
      throw new Error(errorMessage2);
    }
    finally {
      callHistory.push("apiFunc2 end");
    }
  });

  const apiData3 = { data: "api response data 3" };
  const mockBeginCallback3 = jest.fn(() => callHistory.push("begin3"));
  const mockSuccessCallback3 = jest.fn(() => callHistory.push("success3"));
  const mockFailedCallback3 = jest.fn(() => callHistory.push("failed3"));

  const mockApiFunctionAsync3 = jest.fn(async () => {
    callHistory.push("apiFunc3 start");
    try {
      await wait(200);
      return apiData3;
    }
    finally {
      callHistory.push("apiFunc3 end");
    }
  });

  const requestScope = createRequestScope();
  const request1 = requestScope.getRequest(
    mockBeginCallback1,
    mockSuccessCallback1,
    mockFailedCallback1
  );
  const request2 = requestScope.getRequest(
    mockBeginCallback2,
    mockSuccessCallback2,
    mockFailedCallback2
  );
  const request3 = requestScope.getRequest(
    mockBeginCallback3,
    mockSuccessCallback3,
    mockFailedCallback3
  );
  await Promise.all([
    request1(mockApiFunctionAsync1),
    request2(mockApiFunctionAsync2),
    request3(mockApiFunctionAsync3)
  ]);

  expect(mockBeginCallback1).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback1).toHaveBeenCalledWith();
  expect(mockApiFunctionAsync1).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync1).toHaveBeenCalledWith();

  expect(mockBeginCallback2).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback2).toHaveBeenCalledWith();
  expect(mockApiFunctionAsync2).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync2).toHaveBeenCalledWith();

  expect(mockBeginCallback3).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback3).toHaveBeenCalledWith();
  expect(mockApiFunctionAsync3).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync3).toHaveBeenCalledWith();

  expect(mockSuccessCallback1).toHaveBeenCalledTimes(1);
  expect(mockSuccessCallback1).toHaveBeenCalledWith(apiData1, true); // loading

  expect(mockFailedCallback2).toHaveBeenCalledTimes(1);
  expect(mockFailedCallback2.mock.calls[0].length).toBe(2); // two arguments
  expect(mockFailedCallback2.mock.calls[0][0].message).toBe(errorMessage2);
  expect(mockFailedCallback2.mock.calls[0][1]).toBe(true);// loading

  expect(mockSuccessCallback3).toHaveBeenCalledTimes(1);
  expect(mockSuccessCallback3).toHaveBeenCalledWith(apiData3, false);

  expect(mockFailedCallback1).not.toHaveBeenCalled();
  expect(mockSuccessCallback2).not.toHaveBeenCalled();
  expect(mockFailedCallback3).not.toHaveBeenCalled();

  expect(callHistory).toEqual([
    "begin1",
    "apiFunc1 start",
    "begin2",
    "apiFunc2 start",
    "begin3",
    "apiFunc3 start",
    "apiFunc1 end",
    "success1",
    "apiFunc2 end",
    "failed2",
    "apiFunc3 end",
    "success3",
  ]);

  done();
});

test("(1,3,2x)", async (done) => {
  // three requests 1, 2, 3, -1, -3, -2x
  const callHistory = [];

  const apiData1 = { data: "api response data 1" };
  const mockBeginCallback1 = jest.fn(() => callHistory.push("begin1"));
  const mockSuccessCallback1 = jest.fn(() => callHistory.push("success1"));
  const mockFailedCallback1 = jest.fn(() => callHistory.push("failed1"));

  const mockApiFunctionAsync1 = jest.fn(async () => {
    callHistory.push("apiFunc1 start");
    try {
      await wait(10);
      return apiData1;
    }
    finally {
      callHistory.push("apiFunc1 end");
    }
  });

  const errorMessage2 = "test error 2";
  const mockBeginCallback2 = jest.fn(() => callHistory.push("begin2"));
  const mockSuccessCallback2 = jest.fn(() => callHistory.push("success2"));
  const mockFailedCallback2 = jest.fn(() => callHistory.push("failed2"));

  const mockApiFunctionAsync2 = jest.fn(async () => {
    callHistory.push("apiFunc2 start");
    try {
      await wait(200);
      throw new Error(errorMessage2);
    }
    finally {
      callHistory.push("apiFunc2 end");
    }
  });

  const apiData3 = { data: "api response data 3" };
  const mockBeginCallback3 = jest.fn(() => callHistory.push("begin3"));
  const mockSuccessCallback3 = jest.fn(() => callHistory.push("success3"));
  const mockFailedCallback3 = jest.fn(() => callHistory.push("failed3"));

  const mockApiFunctionAsync3 = jest.fn(async () => {
    callHistory.push("apiFunc3 start");
    try {
      await wait(100);
      return apiData3;
    }
    finally {
      callHistory.push("apiFunc3 end");
    }
  });

  const requestScope = createRequestScope();
  const request1 = requestScope.getRequest(
    mockBeginCallback1,
    mockSuccessCallback1,
    mockFailedCallback1
  );
  const request2 = requestScope.getRequest(
    mockBeginCallback2,
    mockSuccessCallback2,
    mockFailedCallback2
  );
  const request3 = requestScope.getRequest(
    mockBeginCallback3,
    mockSuccessCallback3,
    mockFailedCallback3
  );
  await Promise.all([
    request1(mockApiFunctionAsync1),
    request2(mockApiFunctionAsync2),
    request3(mockApiFunctionAsync3)
  ]);

  expect(mockBeginCallback1).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback1).toHaveBeenCalledWith();
  expect(mockApiFunctionAsync1).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync1).toHaveBeenCalledWith();

  expect(mockBeginCallback2).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback2).toHaveBeenCalledWith();
  expect(mockApiFunctionAsync2).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync2).toHaveBeenCalledWith();

  expect(mockBeginCallback3).toHaveBeenCalledTimes(1);
  expect(mockBeginCallback3).toHaveBeenCalledWith();
  expect(mockApiFunctionAsync3).toHaveBeenCalledTimes(1);
  expect(mockApiFunctionAsync3).toHaveBeenCalledWith();

  expect(mockSuccessCallback1).toHaveBeenCalledTimes(1);
  expect(mockSuccessCallback1).toHaveBeenCalledWith(apiData1, true); // loading

  expect(mockSuccessCallback3).toHaveBeenCalledTimes(1);
  expect(mockSuccessCallback3).toHaveBeenCalledWith(apiData3, false);

  expect(mockFailedCallback1).not.toHaveBeenCalled();
  expect(mockFailedCallback2).not.toHaveBeenCalled();
  expect(mockSuccessCallback2).not.toHaveBeenCalled();
  expect(mockFailedCallback3).not.toHaveBeenCalled();

  expect(callHistory).toEqual([
    "begin1",
    "apiFunc1 start",
    "begin2",
    "apiFunc2 start",
    "begin3",
    "apiFunc3 start",
    "apiFunc1 end",
    "success1",
    "apiFunc3 end",
    "success3",
    "apiFunc2 end"
  ]);

  done();
});
//#endregion three requests with non-last fail
//#endregion three requests

test("Sample use case", async (done) => {
  // three requests, the order of response is:
  // search  (pro)
  // search  (progr)
  // search  (program)
  // respond (pro)
  // respond (program)
  // respond (progr)
  // in the view there would be a table showing the results, with a loading icon 
  const stateHistory = [];
  const apiDataMap = {
    "pro": ["expert", "technicalized", "specialist"],
    "progr": [],
    "program": ["agenda", "calendar", "docket"]
  };
  const apiWaitMap = {
    "pro": 100,
    "progr": 300,
    "program": 200
  };
  // not really redux
  const [getState, dispatch] = (() => {
    let state = {
      isLoading: false,
      keywordResults: [],
      failedReason: null
    };

    stateHistory.push({ ...state });
    const dispatch = action => {
      let updated = false;
      if (action.type === "begin") {
        updated = state.isLoading !== true || !Object.is(state.failedReason, null);
        if (updated) {
          state = {
            ...state,
            isLoading: true,
            failedReason: null
          };
        }
      }
      else if (action.type === "setKeywordResults") {
        updated = true;
        state = {
          isLoading: false,
          keywordResults: action.results,
          failedReason: null
        };
      }
      else if (action.type === "setFailedReason") {
        updated = true;
        state = {
          isLoading: false,
          keywordResults: [],
          failedReason: action.failedReason
        };
      }
      if (updated) {
        stateHistory.push({ ...state });
      }
    };

    const getState = () => state;
    return [getState, dispatch]
  })();

  const beginCallback = () => dispatch({ type: "begin" });
  const successCallback = (results, loading) => {
    if (!loading) { // not dispatch when still loading (this is not the last request)
      dispatch({ type: "setKeywordResults", results: [...results] });
    }
  };
  const failedCallback = (error, loading) => {
    if (!loading) { // not dispatch when still loading (this is not the last request)
      dispatch({ type: "setKeywordResults", failedReason: error.message });
    }
  };

  const mockApiFunctionAsync = async (keyword) => {
    await wait(apiWaitMap[keyword]);
    return apiDataMap[keyword];
  };

  const requestScope = createRequestScope();
  const request = requestScope.getRequest(
    beginCallback,
    successCallback,
    failedCallback
  );
  await Promise.all([
    request(() => mockApiFunctionAsync("pro")),
    request(() => mockApiFunctionAsync("progr")),
    request(() => mockApiFunctionAsync("program"))
  ]);

  expect(stateHistory).toEqual([
    {
      isLoading: false,
      keywordResults: [],
      failedReason: null
    },
    {
      isLoading: true,
      keywordResults: [],
      failedReason: null
    },
    {
      isLoading: false,
      keywordResults: ["agenda", "calendar", "docket"],
      failedReason: null
    },
  ]);

  expect(getState().keywordResults).toEqual(["agenda", "calendar", "docket"]);

  done();
});