const ApiBuilder = require("claudia-api-builder")
const api = new ApiBuilder()
const { sendSMS } = require("./lib")
// const fs = require("fs")
// const util = require("util")
module.exports = api

/**
 *
 * @api {post} / Send the SMS
 * @apiName sendSMS
 *
 * @apiHeader {String} Authorization The Access Token in the format `Token abcd1234efgh3456xyz`
 *
 * @apiParam  {String} service=plivo The 3rd party SMS service to be used. One of "plivo", "nexmo", "twilio", "textlocal". Set appropriate config values in lambda environment variables
 * @apiParam  {String} toNo The number to send to
 * @apiParam  {String} msg The message to send
 *
 */
api.post("/", (req) => {
  const { service, toNo, msg } = req.body
  const { authorization } = req.normalizedHeaders
  if (!authorization) return new api.ApiResponse("AUTH REQUIRED", { "X-Version": "202", "Content-Type": "text/plain" }, 401)
  const token = authorization.split(" ").pop()
  if (token === undefined || token.trim() !== process.env.ACCESS_TOKEN) return new api.ApiResponse("AUTH FAILED", { "X-Version": "202", "Content-Type": "text/plain" }, 403)
  return sendSMS(service, toNo, msg)
})
