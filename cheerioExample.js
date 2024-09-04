const axios = require('axios');
const cheerio = require('cheerio');
const TinyURL = require('tinyurl');
const highlightKeywords = require('./highlightKeywords'); // 導入 highlightKeywords 函數

let lastYahooData = ''; // 儲存上次抓取的 Yahoo Finance HTML 資料
let lastGoogleData = ''; // 儲存上次抓取的 Google Finance HTML 資料
let lastFoxconnData = ''; // 儲存上次抓取的鴻海新聞 HTML 資料

async function fetchNewsTitles(chalk) {
    try {
        // 抓取 Yahoo Finance 的新聞標題
        const yahooResponse = await axios.get('https://tw.news.yahoo.com/finance/');
        const yahooData = yahooResponse.data;

        if (yahooData !== lastYahooData) {
            lastYahooData = yahooData;
            const $ = cheerio.load(yahooData);
            const yahooTitles = [];

            $('.Cf').each((index, element) => {
                let title = $(element).find('h3').text().trim();
                title = highlightKeywords(title, chalk);
                yahooTitles.push(title);
            });

            console.log(chalk.yellow('Yahoo Finance 新聞標題:'));
            yahooTitles.forEach((title, index) => {
                console.log(`${index + 1}. ${title}`);
                console.log(''); // 插入空行以模擬行距
            });
        }

        // 抓取 Google Finance 的新聞標題
        const googleResponse = await axios.get('https://www.google.com/finance/?hl=zh-TW');
        const googleData = googleResponse.data;

        if (googleData !== lastGoogleData) {
            lastGoogleData = googleData;
            const $ = cheerio.load(googleData);
            const googleTitles = [];

            $('.Yfwt5').each((index, element) => {
                let title = $(element).text().trim();
                title = highlightKeywords(title, chalk);
                googleTitles.push(title);
            });

            // 顯示 Google Finance 新聞標題
            console.log(chalk.yellow('Google Finance 新聞標題:'));
            googleTitles.forEach((title, index) => {
                console.log(`${index + 1}. ${title}`);
                console.log(''); // 插入空行以模擬行距
            });
        }

        // 抓取鴻海（2317.TW）的新聞標題
        const foxconnResponse = await axios.get('https://tw.stock.yahoo.com/quote/2317.TW');
        const foxconnData = foxconnResponse.data;

        if (foxconnData !== lastFoxconnData) {
            lastFoxconnData = foxconnData;
            const $ = cheerio.load(foxconnData);
            const foxconnNews = [];

            // 用 Promise.all 處理所有連結的縮短
            const promises = [];
            $('.Cf').each((index, element) => {
                const titleElement = $(element).find('h3');
                const title = titleElement.text().trim();
                const link = $(element).find('a').attr('href');

                // 添加連結縮短的 Promise
                if (link) {
                    promises.push(TinyURL.shorten(link).then(shortLink => {
                        foxconnNews.push({ title: highlightKeywords(title, chalk), link: shortLink });
                    }));
                }
            });

            // 等待所有連結縮短完成
            await Promise.all(promises);

            // 顯示鴻海新聞標題及縮短後的連結
            console.log(chalk.yellow('鴻海新聞標題:'));
            foxconnNews.forEach((news, index) => {
                console.log(`${index + 1}. ${news.title}`);
                if (news.link) {
                    console.log(`   連結: ${news.link}`);
                }
                console.log(''); // 插入空行以模擬行距
            });
        }
    } catch (error) {
        console.error('抓取資料時發生錯誤:', error);
    }
}

(async () => {
    const chalk = (await import('chalk')).default;
    await fetchNewsTitles(chalk);
    setInterval(() => fetchNewsTitles(chalk), 300000);
})();

