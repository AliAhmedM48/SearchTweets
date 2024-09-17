// PACKAGES
// -------------------------------
const moment = require("moment");

const puppeteer = require("puppeteer");

// VARIABLES
// -------------------------------
const config = require("./config.js");

// FUNCTIONS
// -------------------------------

//#region Calculates the ISO string representing the time that is `timeAgo` minutes ago or at a specific date.
const getTimeAgo = (timeAgo) => {
  const now = moment();
  if (timeAgo.type === "min") {
    const pastTime = now.subtract(timeAgo.min, "minutes");
    return { time: pastTime.toISOString(), pastTime: pastTime.fromNow() };
  } else if (timeAgo.type === "time") {
    const pastTime = moment(timeAgo.time);
    return {
      time: pastTime.toISOString(),
      pastTime: pastTime.fromNow(),
    };
  } else {
    throw new Error("Unsupported time type.");
  }
};
//#endregion

//#region Logs in to Twitter using Puppeteer.
const loginToTwitter = async (
  page,
  twitterUrl,
  email,
  password,
  phoneNumber
) => {
  await page.goto(twitterUrl);

  //#region email input & next button
  await page.waitForSelector("input[name='text']", { timeout: 120_000 });
  await page.type("input[name='text']", email, { delay: 100 });
  await page.click('button[role="button"]:nth-of-type(2)');
  //#endregion

  //#region phoneNumber input & next button
  await page.waitForSelector('input[name="text"]', { timeout: 120_000 });
  await page.type('input[name="text"]', phoneNumber, { delay: 100 });
  await page.click('button[data-testid="ocfEnterTextNextButton"]');
  //#endregion

  //#region password input & next button
  await page.waitForSelector('input[name="password"]', { timeout: 120_000 });
  await page.type('input[name="password"]', password, { delay: 100 });
  await page.click('button[data-testid="LoginForm_Login_Button"]');
  //#endregion
};
//#endregion

//#region Scrapes tweets from a specific Twitter account and counts the mentions of a given ticker.
const scrapeTweetsOneAccount = async (page, url, ticker, timeAgo) => {
  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 120_000 }); // or networkidle0
    const accountTitle = await page.title();
    await page.waitForSelector("article", { timeout: 120_000 });

    let tweets = [];

    if (config.scrolling) {
      //#region Scrolling
      let reachedTimeAgo = false;
      let lastHeight = await page.evaluate("document.body.scrollHeight");

      while (!reachedTimeAgo) {
        let temp = await page.evaluate(() => {
          const tweetElements = Array.from(
            document.querySelectorAll("article")
          );

          const tweetData = tweetElements.map((tweet) => {
            const tweetBody = tweet.innerText;
            const tweetTime =
              tweet?.querySelector("time")?.getAttribute("datetime") || "";
            return { tweetBody, tweetTime };
          });

          return tweetData;
        });

        temp.forEach((element) => {
          console.log(element.tweetTime);
        });

        const filteredTweets = temp.filter(
          (tweet) => tweet.tweetTime >= getTimeAgo(timeAgo).time
        );

        tweets = [...tweets, ...filteredTweets];

        reachedTimeAgo = temp.some(
          (tweet) =>
            new Date(tweet.tweetTime) < new Date(getTimeAgo(timeAgo).time)
        );

        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)");
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const newHeight = await page.evaluate("document.body.scrollHeight");
        if (newHeight === lastHeight) {
          break;
        }

        lastHeight = newHeight;
      }
      //#endregion
    } else {
      tweets = await page.evaluate(() => {
        const tweetElements = Array.from(document.querySelectorAll("article"));

        const tweetData = tweetElements.map((tweet) => {
          const tweetBody = tweet.innerText;
          const tweetTime = tweet
            .querySelector("time")
            .getAttribute("datetime");
          return { tweetBody, tweetTime };
        });

        return tweetData;
      });
    }

    const filteredTweets = tweets.filter(
      (tweet) =>
        tweet.tweetBody.includes(ticker) &&
        tweet.tweetTime >= getTimeAgo(timeAgo).time
    );

    const totalMentions = filteredTweets.reduce((count, tweet) => {
      const mentions = (
        tweet.tweetBody.match(new RegExp(`\\${ticker}`, "g")) || []
      ).length;

      return count + mentions;
    }, 0);

    const scrapedData = {
      accountTitle: accountTitle,
      tickerCounter: totalMentions,
    };

    if (config.logAccountDetails) {
      console.log(
        "Account title:",
        scrapedData.accountTitle,
        "contains",
        scrapedData.tickerCounter,
        "times across",
        tweets.length,
        "tweets."
      );
    }

    return scrapedData;
  } catch (error) {
    console.error(`Error scraping ${url}:`, error.message);
    return { accountTitle: url, tickerCounter: 0 };
  }
};
//#endregion

//#region Scrapes tweets from a list of Twitter accounts and counts the mentions of a specified ticker.
const scrap = async (accountsList, ticker, timeAgo) => {
  let totalMentions = 0;
  const browser = await puppeteer.launch({ headless: !config.openBrowser }); // true for ui browser invisible mode
  const page = await browser.newPage();

  if (config.openBrowser) {
    const width = 968;
    const height = 919;

    await page.evaluate(
      ({ width, height }) => {
        window.resizeTo(width, height);
      },
      { width, height }
    );

    await page.setViewport({ width, height });
  }

  await loginToTwitter(
    page,
    config.login.url,
    config.login.email,
    config.login.password,
    config.login.phoneNumber
  );

  await page.waitForNavigation({ waitUntil: "networkidle2" });

  for (const urlAccount of accountsList) {
    const scrapedData = await scrapeTweetsOneAccount(
      page,
      urlAccount,
      ticker,
      timeAgo
    );
    totalMentions += scrapedData.tickerCounter;
  }

  await browser.close();
  return totalMentions;
};
//#endregion

//#region `app` to handle the scraping process
const app = async (
  twitterAccounts,
  ticker,
  timeAgo,
  scrapingIntervalMinutes
) => {
  console.log(
    `\nStarting Twitter scraping for ${ticker} every ${scrapingIntervalMinutes} minutes...\n`
  );

  const totalMentions = await scrap(twitterAccounts, ticker, timeAgo);

  console.log(
    `\n[${ticker}] was mentioned [`,
    totalMentions,
    ` times] in the last [${getTimeAgo(timeAgo).pastTime}].`
  );
};
//#endregion

// FUNCTIONS CALLING
// -------------------------------

// Initial call to start scraping immediately
app(
  config.twitterAccounts,
  config.ticker,
  config.timeAgo,
  config.scrapingIntervalMinutes
);
setInterval(
  app,
  config.scrapingIntervalMinutes * 60 * 1000,
  config.twitterAccounts,
  config.ticker,
  config.timeAgo,
  config.scrapingIntervalMinutes
);
