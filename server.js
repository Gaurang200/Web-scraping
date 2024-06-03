const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const path1 = require("path");
puppeteer.use(StealthPlugin());

async function createDriver(curpValue) {
  let browser;
  try {
    const path = path1.join(__dirname, "config.js");
    const browser = await puppeteer.launch({
      headless: true,
      args: [`--disable-extensions-except=${path}`, ],
    });               
    var page = await browser.newPage();
    await page.goto("https://www.gob.mx/curp/");
    await page.waitForSelector("#curpinput");
    await page.waitForSelector("#searchButton");
    await page.type("#curpinput", curpValue);
    await page.click("#searchButton");
    // await page.waitForNavigation();


    const updatedValue = await page.$eval("#curpinput", (input) => input.value);
    console.log("Updated value:", updatedValue);
    await page.waitForSelector(".col-md-7");

    const curpInfo = await page.$eval(
      ".col-md-7 .panel .panel-body table:first-child",
      (table) => {
        const info = {};
        const rows = table.querySelectorAll("tr");
        rows.forEach((row) => {
          const label = row.querySelector("td:first-child").textContent.trim();
          const value = row.querySelector("td:last-child").textContent.trim();
          info[label] = value;
        });
        return info;
      }
    );
    const curpInfo1 = await page.$eval(
      ".col-md-5 .panel .panel-body table:last-child",
      (table) => {
        const info = {};
        const rows = table.querySelectorAll("tr");
        rows.forEach((row) => {
          const label = row.querySelector("td:first-child").textContent.trim();
          const value = row.querySelector("td:last-child").textContent.trim();
          info[label] = value;
        });
        return info;
      }
    );
    const data = { ...curpInfo, ...curpInfo1 };
    console.log(data, "curpInfo");
  } catch (error) {
    console.error("An error occurred:", error);
    await page.waitForSelector("#curpinput");
    await page.waitForSelector("#searchButton");

    await page.type("#curpinput", curpValue);
    await page.click("#searchButton");

   
    // await browser.close();
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

createDriver("SIBR730704HJCQRB05");

