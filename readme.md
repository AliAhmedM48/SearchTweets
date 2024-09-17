# Twitter Ticker Mention Scraper

This project scrapes tweets from a list of Twitter accounts and counts the mentions of a specified stock ticker within a given time frame. It uses Puppeteer to automate the login process and interact with Twitter's web interface.

## Features

- Scrapes tweets from multiple Twitter accounts.
- Counts how many times a specific ticker (e.g., $TSLA) is mentioned.
- Configurable time range for scraping (in minutes or a specific date/time).
- Supports logging into Twitter with email, phone number, and password.
- Automatic scrolling through tweets to load more content.
- Browser automation with Puppeteer.
- Periodic scraping at configurable intervals.

## Technologies Used

- [Node.js](https://nodejs.org/)
- [Puppeteer](https://pptr.dev/)
- [Express](https://expressjs.com/)
- [Moment.js](https://momentjs.com/)
- [dotenv](https://github.com/motdotla/dotenv)

## Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/AliAhmedM48/SearchTweets.git
   cd SearchTweets
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Create a .env file in the project root and add your Twitter credentials:

   ```bash
   url=https://x.com/i/flow/login
   email=YOUR_EMAIL@GMAIL.COM
   password=YOUR_PASSWORD
   phoneNumber=YOUR_MOBILE_PHONE
   ```

## Configuration

Modify the config.js file to update the list of Twitter accounts, ticker, scraping interval, and other settings:

- twitterAccounts: Array of Twitter account URLs.
- ticker: The stock ticker to track (e.g., $TSLA).
- scrapingIntervalMinutes: Interval in minutes for scraping.
- timeAgo: Configure whether to scrape tweets from the last X minutes or from a specific date.

  ```bash
  module.exports = {
  ticker: "$TSLA",
  twitterAccounts: [
    "https://twitter.com/account1",
    "https://twitter.com/account2",
    // more accounts
  ],
  scrapingIntervalMinutes: 10,
  timeAgo: {
    type: "min", // 'min' or 'time' for a specific date
    min: 50,
    time: "2024-07-01T00:00:00.000Z",
  },
  openBrowser: true,
  logAccountDetails: true,
  };
  ```

## Usage

To run the project, you can use the following scripts:

- Start the app:
  ```bash
  npm start
  ```
- Start with nodemon for development:

  ```bash
  npm run dev
  ```

  The app will log into Twitter, scrape tweets from the configured accounts, and count the mentions of the specified ticker within the defined time frame. The process will repeat at the specified interval.
