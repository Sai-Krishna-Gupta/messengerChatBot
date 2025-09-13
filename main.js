const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
app.use(bodyParser.json());
app.set("port", process.env.PORT || 3000);
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
console.log(process.env.VERIFY_TOKEN)
  
app.get(`/`, (req, res) => {
  res.status(200).send("Hello World");
});
app.get(`/webhook`, (req, res) => {
  console.log(req.query);
  let VERIFY_TOKEN = "SaiRam123";
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];
  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Webhook Verified");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

app.post(`/webhook`, (req, res) => {
  console.log(req.body);
  let body = req.body;

  if (body.object === "page") {
    body.entry.forEach(async function (entry) {
      let webhook_event = entry.messaging[0];
      let sender_psid = webhook_event.sender.id;

      if (webhook_event.message) {
        await handleMessage(sender_psid, webhook_event.message);
      }
    });
    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

async function handleMessage(sender_psid, received_message) {
  let response;

  if (received_message.text) {
    response = {
      text: `You sent: "${received_message.text}". Thanks for reaching out!`,
    };
  }

  await callSendAPI(sender_psid, response);
}

async function callSendAPI(sender_psid, response) {
  let request_body = {
    recipient: { id: sender_psid },
    message: response,
  };

  try{
    const res = await axios.post("https://graph.facebook.com/v17.0/me/messages",request_body,{
      params: {access_token: PAGE_ACCESS_TOKEN},
      headers: {"Content-Type": "application/json"},
    });
    console.log("Message Sent!", res.data);
  } catch(err){
if (err.response) {
      console.error("Graph API error:", err.response.status, err.response.data);
    } else {
      console.error("Axios error:", err.message);
    }
  }
}

app.listen(app.get("port"), () => {
  console.log(`Server is listening on ${app.get("port")}`);
});
