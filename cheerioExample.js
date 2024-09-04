const axios = require('axios');
const cheerio = require('cheerio');
const highlightKeywords = require('./highlightKeywords'); // 導入 highlightKeywords 函數

let lastYahooData = ''; // 儲存上次抓取的 Yahoo HTML 資料
let lastGoogleData = ''; // 儲存上次抓取的 Google Finance HTML 資料

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

            // 清除終端機中的舊資料並顯示 Yahoo Finance 新聞標題
            console.clear();
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

            // 清除終端機中的舊資料並顯示 Google Finance 新聞標題
            console.log(chalk.yellow('Google Finance 新聞標題:'));
            googleTitles.forEach((title, index) => {
                console.log(`${index + 1}. ${title}`);
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
