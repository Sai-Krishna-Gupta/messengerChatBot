const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const app = express();
app.use(bodyParser.json());
const PAGE_ACCESS_TOKEN = "EAAZCZCaypH4lgBPR02uElfysWm8i9Ip9cAfZCZBfYMLKQGU6nsobQPoRcE4NZC9tOQ5uQcIpHDi7yH9EeT7J2yM9WDj1m4o4pT4bxBEO5b0mPIQx1vkZCN13LkpUKgWZCjq6DLxB8psVlJ3TDiVLxZBjAJA4NjAVZBZCxlA0veZBUPGe9yO1Nj6ShPnE95JpgnTULmcnX3nlLHuKQZDZD";
app.get("/", (req,res)=> {
  res.render("Hello World");
})
app.get("/webhook", (req,res) => {
    let VERIFY_TOKEN = "SaiRam123";
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];
    if(mode &&token){
        if (mode==="subscribe" &&token===VERIFY_TOKEN){
            console.log("Webhook Verified");
            res.status(200).send(challenge);
        } else{
            res.sendStatus(403);
        }
    }

});

app.post("/webhook", (req, res) => {
  let body = req.body;

  if (body.object === "page") {
    body.entry.forEach(function(entry) {
      let webhook_event = entry.messaging[0];
      let sender_psid = webhook_event.sender.id;

      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      }
    });
    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

function handleMessage(sender_psid, received_message) {
  let response;

  if (received_message.text) {
    response = {
      text: `You sent: "${received_message.text}". Thanks for reaching out!`
    };
  }

  callSendAPI(sender_psid, response);
}

function callSendAPI(sender_psid, response) {
  let request_body = {
    recipient: { id: sender_psid },
    message: response
  };

  request(
    {
      uri: "https://graph.facebook.com/v17.0/me/messages",
      qs: { access_token: PAGE_ACCESS_TOKEN },
      method: "POST",
      json: request_body
    },
    (err, res, body) => {
      if (!err) {
        console.log("Message sent!");
      } else {
        console.error("Unable to send message:" + err);
      }
    }
  );
}

app.listen(3000, () => console.log("Webhook is listening on port 3000"));