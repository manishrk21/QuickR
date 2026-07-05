import axios from "axios";

export async function sendSms(mobile: string, message: string) {
  await axios.post(
    "https://api.msg91.com/api/v5/flow/",
    {
      template_id: process.env.MSG91_TEMPLATE_ID,
      short_url: "0",
      mobiles: `91${mobile}`,
      var1: message,
    },
    {
      headers: {
        authkey: process.env.MSG91_AUTH_KEY!,
        "Content-Type": "application/json",
      },
    }
  );
}
