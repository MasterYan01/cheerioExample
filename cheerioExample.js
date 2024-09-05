const axios = require('axios');
const cheerio = require('cheerio');
const TinyURL = require('tinyurl');
const highlightKeywords = require('./highlightKeywords'); // 導入 highlightKeywords 函數

let lastYahooData = ''; // 儲存上次抓取的 Yahoo Finance HTML 資料

async function fetchNewsTitles(chalk) {
    try {
        // 抓取 Yahoo Finance 的新聞標題
        const yahooResponse = await axios.get('https://tw.news.yahoo.com/finance/');
        const yahooData = yahooResponse.data;

        if (yahooData !== lastYahooData) {
            lastYahooData = yahooData;
            const $ = cheerio.load(yahooData);
            const yahooNews = [];

            // 用 Promise.all 處理所有連結的縮短
            const promises = [];
            $('.Cf').each((index, element) => {
                const titleElement = $(element).find('h3');
                const title = titleElement.text().trim();
                const link = $(element).find('a').attr('href'); // 抓取 a 標籤的 href 屬性

                // 如果有鏈接，進行縮短
                if (link) {
                    const fullLink = `https://tw.news.yahoo.com${link}`; // 如果是相對路徑，拼接完整鏈接
                    promises.push(TinyURL.shorten(fullLink).then(shortLink => {
                        yahooNews.push({ title: highlightKeywords(title, chalk), link: shortLink });
                    }));
                }
            });

            // 等待所有連結縮短完成
            await Promise.all(promises);

            // 顯示 Yahoo Finance 新聞標題及縮短後的連結
            console.log(chalk.yellow('Yahoo Finance 新聞標題:'));
            yahooNews.forEach((news, index) => {
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
    setInterval(() => fetchNewsTitles(chalk), 30000); 
})();
