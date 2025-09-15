const express = require("express");
const bodyParser = require("body-parser");
const { CohereClient } = require("cohere-ai");
const dotenv = require("dotenv");
const app = express();
app.use(bodyParser.json());
app.set("port", process.env.PORT || 3000);
dotenv.config();
const documents = [
  {title: "Menu", snippet: JSON.stringify([
    {item: "Veggie Mash Burger"},
    {item: "Paneer Zinger Burger"},
    {item: "Creamy grilled Sandwich"},
    {item: "Coleslaw Sandwich"},
    {item: "Quesadillas"},
    {item: "Stuffed Kulcha"},
    {item: "Desi Pancakes"}
  ])},
  {title: "Location", snippet: "Cobbs Pond Rotary Park"},
  {title: "Hours", snippet: "10AM-2PM on September 27"}
]
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
})
app.get(`/`, (req, res) => {
  res.status(200).send("Hello World");
});
app.get(`/webhook`, (req, res) => {
  let VERIFY_TOKEN = process.env.VERIFY_TOKEN;
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


async function getReply(message){
  try{
    const response = await cohere.chat({
      model: "command-r",
      message: message,
      documents: documents
    })
    return response;
  } catch (err){
    console.log("Error: ", err);
  }

}

async function handleMessage(sender_psid, received_message) {
  let response;

  if (received_message.text) {
    response = await getReply(received_message.text)
  }

  await callSendAPI(sender_psid, response);
}

async function callSendAPI(sender_psid, response) {
  const request_body = {
    recipient: { id: sender_psid },
    message: response,
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/v17.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request_body),
      }
    );

    if (!res.ok) {
      const errData = await res.json();
      console.error("Graph API error:", res.status, errData);
    } else {
      const data = await res.json();
      console.log("Message sent!", data);
    }
  } catch (err) {
    console.error("Fetch error:", err.message);
  }
}

app.listen(app.get("port"), () => {
  console.log(`Server is listening on ${app.get("port")}`);
});
