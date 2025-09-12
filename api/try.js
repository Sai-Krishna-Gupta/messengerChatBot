// const { CohereClient } = require("cohere-ai");
// const dotenv = require("dotenv");
// dotenv.config();
// const cohere = new CohereClient({ token: process.env.COHERE_API_KEY });
// message = `what is 234-345+34534`;
// const storeInfo = `
// We are Desi Mexicana Kitchen. 
// We sell:
// - Tacos (veg & chicken)
// - Burritos
// - Nachos
// - Mango Lassi
// - Churros
// We are open Mon-Sat, 11 AM - 9 PM.
// `;

const { request } = require("express");





// const asyncFunction = async () => {
// //   const response = await cohere.chat({
// //     model: "command-r-plus-08-2024",
// //     message: `Tell me a joke about programmers.`
// //   });
// const response = await cohere.chat({
//   model: "command-r-plus-08-2024",
//   message: `Answer based only on this store info: ${storeInfo}. 
//   Question: What drinks do you have?`,
// });

//   console.log(response);
// };

// asyncFunction();







const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());

app.get("/", (req,res) => {
  res.send("Hello World!");
})
app.get("/secondRoute", (req,res) => {
  res.send("Second Route works");
})
app.post("/secondRoute", (req,res) => {
  req.send("Route works for posting also.")
})

module.exports ((req,res) => {app(req,res)});
