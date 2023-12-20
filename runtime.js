#!/usr/bin/env node

const AWS_LAMBDA_RUNTIME_API = process.env.AWS_LAMBDA_RUNTIME_API;

// Load function handler
const lambda = require('./index.js');

/**
 * Get an event from the Lambda Runtime API.
 */
const getLambdaEvent = async () => {
  return await fetch(`http://${AWS_LAMBDA_RUNTIME_API}/2018-06-01/runtime/invocation/next`);
}

/**
 * Extract the request ID from the response headers.
 */
const extractRequestId = (hdr) => {
  return hdr.get('lambda-runtime-aws-request-id');
}

/**
 * Send the response to the Lambda Runtime API.
 */
const sendResponse = async (rid, res) => {
  await fetch(`http://${AWS_LAMBDA_RUNTIME_API}/2018-06-01/runtime/invocation/${rid}/response`, {
    method: 'POST',
    body: JSON.stringify(res)
  });
}

// Processing
const invoke = async () => {
  while (true) {
    // Get an event. The HTTP requset will block until one is received.
    const evt = await getLambdaEvent();

    // Extract request ID by scraping response headers received above.
    const rid = extractRequestId(evt.headers);

    // Extract the event body from the response.
    const bod = await evt.json();

    // Run the handler function from the script.
    const res = await lambda.handler(bod);

    // Send the response
    await sendResponse(rid, res);
  }
}

invoke();
