const Plivo = require("plivo")
const Nexmo = require("nexmo")
const Twilio = require("twilio")
const fetch = require("node-fetch")
const querystring = require("querystring")

// const config = require("./config")[process.env.NODE_ENV || "development"]

module.exports = {
  /**
   * @param {*} service. enum["plivo", "nexmo", "twilio", "textlocal", "smshorizon"]
   * @param {*} toNo
   * @param {*} msg
   */
  sendSMS(service = "plivo", toNo, msg) {
    return new Promise((resolve, reject) => {
      if (service === "plivo") {
        reject(new Error("Plivo not set up yet...."))
        const plivo = Plivo.RestAPI({
          authId: process.env.PLIVO_AUTH_ID,
          authToken: process.env.PLIVO_AUTH_TOKEN
        })
        // send sms using Plivo, but don't wait for it to complete...
        const params = {
          src: process.env.PLIVO_FROM_NO, // Sender's phone number with country code
          dst: toNo, // Receiver's phone Number with country code
          text: msg, // Your SMS Text Message - English
        }

        // Prints the complete response
        plivo.send_message(params, (status, response) => {
          console.log("Plivo Status: ", status)
          console.log("Plivo API Response:\n", response)
          console.log("Plivo Message UUID:\n", response.message_uuid)
          console.log("Plivo Api ID:\n", response.api_id)
          if (String(status) !== "202") reject(new Error("FAILED TO SEND SMS"))
          resolve("OK")
        })
      // Service: NEXMO
      } else if (service === "nexmo") {
        const nexmo = new Nexmo({
          apiKey: process.env.NEXMO_API_KEY,
          apiSecret: process.env.NEXMO_API_SECRET,
          // applicationId: process.env.nexmo.applicationId,
          // privateKey: PRIVATE_KEY_PATH,
        })

        nexmo.message.sendSms(process.env.NEXMO_FROM_NO, toNo, msg, {}, (err, response) => {
          if (err) {
            console.log("Nexmo Error: ", err)
            reject(new Error("FAILED TO SEND SMS"))
          }
          console.log("Nexmo response: ", response)
          resolve("OK")
        })
      // Service: TWILIO
      } else if (service === "twilio") {
        const twilio = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
        twilio.messages.create({
          body: msg,
          to: toNo, // Text this number
          from: process.env.TWILIO_FROM_NO // From a valid Twilio number
        })
          .then((message) => {
            console.log("Twilio Response (message.sid): ", message.sid)
            resolve("OK")
          })
          .catch((err) => {
            console.log("Twilio Error: ", err)
            reject(err)
          })
      } else if (service === "textlocal") {
        const query = querystring.stringify({
          apiKey: process.env.TEXTLOCAL_API_KEY,
          numbers: toNo,
          message: msg,
          sender: process.env.TEXTLOCAL_SENDER
        })
        fetch(`${process.env.TEXTLOCAL_SERVICE_EP}?${query}`)
          .then((response) => {
            console.log(response);
            resolve("OK")
          })
          .catch((err) => {
            console.log(err.message);
            resolve("FAILED TO SEND SMS")
          })
      } else {
        reject(new Error("No Valid Service Name Provided!!"))
      }
      // return "Done!!"
    })
    // const destNos = (!Array.isArray(toNos)) ? [toNos] : toNos
    // Service: PLIVO
  }
}
