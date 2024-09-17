require("dotenv").config();

const links = [
  "https://x.com/AliAhmedM48",
  "https://twitter.com/Mr_Derivatives",
  "https://twitter.com/warrior_0719",
  "https://twitter.com/allstarcharts",
  "https://twitter.com/yuriymatso",
  "https://twitter.com/TriggerTrades",
  "https://twitter.com/AdamMancini4",
  "https://twitter.com/CordovaTrades",
  "https://twitter.com/Barchart",
  "https://twitter.com/RoyLMattox",
];

module.exports = {
  ticker: "$TSLA",
  twitterAccounts: links,
  scrapingIntervalMinutes: 10,
  timeAgo: {
    type: "time", // "min" or "time" for a specific date
    min: 50,
    time: "2024-09-01T00:00:00.000Z",
  },
  openBrowser: true,
  logAccountDetails: true,
  scrolling: true,
  //#region login
  login: {
    url: process.env.url,
    email: process.env.email,
    password: process.env.password,
    phoneNumber: process.env.phoneNumber,
  },
  //#endregion
};
