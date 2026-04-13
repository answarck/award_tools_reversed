const get_signin_info = require("./auth.js");
const sendAwardToolRequest = require("./util.js");

async function start() {
  try {
    console.log("Authenticating.....");
    const singnin_info = await get_signin_info(
      "d7kgjxkeqi@bwmyga.com",
      "Lol@1234",
    );

    if (!singnin_info) {
      console.error("Failed to acquire singnin_info.");
      return;
    }

    const payload = {
      flight: {
        id: "AA6411",
        airlineCode: "AA",
        flightNo: "6411",
        departureDate: "2026-04-12",
        departure: "SFO",
        arrival: "LAX",
        cabinClass: "E",
      },
      lang: "EN",
      units: "imperials",
      request_time: Date.now(),
      cipher_data: true,
    };

    const result = await sendAwardToolRequest(payload, singnin_info);
    console.log("Response: ", result.data);
  } catch (error) {
    console.error("Execution error:", error);
  }
}
start();
