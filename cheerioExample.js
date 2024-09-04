const axios = require('axios');
const cheerio = require('cheerio');

let lastData = ''; // 儲存上次抓取的 HTML 資料
let lastGoogleFinanceData = ''; // 儲存上次抓取的 Google Finance HTML 資料

function highlightKeywords(title, chalk) {
    return title
        .replace(/鴻海/g, (match) => chalk.red(match))
        .replace(/台積電/g, (match) => chalk.red(match))
        .replace(/AI/g, (match) => chalk.yellow(match))
        .replace(/廣達/g, (match) => chalk.green(match))
        .replace(/緯創/g, (match) => chalk.green(match))
        .replace(/輝達/g, (match) => chalk.green(match));
}

async function fetchNewsTitles(chalk) {
    try {
        // 1. 使用 axios 發送 GET 請求來獲取 Yahoo 新聞的 HTML
        const { data } = await axios.get('https://tw.news.yahoo.com/finance/');
        
        // 檢查 HTML 資料是否更新
        if (data === lastData) {
            // 如果資料沒有變化，則不進行任何操作
            return;
        }

        // 更新 lastData 為當前抓取到的 HTML 資料
        lastData = data;

        // 2. 使用 cheerio 來解析 HTML
        const $ = cheerio.load(data);

        // 3. 選擇要提取的元素（這裡我們選擇新聞標題）
        const titles = [];
        $('.Cf').each((index, element) => {
            let title = $(element).find('h3').text().trim();
            title = highlightKeywords(title, chalk); // 使用 highlightKeywords 函數
            titles.push(title);
        });

        // 4. 在控制台打印結果
        console.log(chalk.yellow('Yahoo Finance 新聞標題:'));
        titles.forEach((title, index) => {
            console.log(`${index + 1}. ${title}`);
            console.log(''); // 插入空行以模擬行距
        });
    } catch (error) {
        console.error('抓取資料時發生錯誤:', error);
    }
}

async function fetchGoogleFinanceNews(chalk) {
    try {
        // 1. 使用 axios 發送 GET 請求來獲取 Google Finance 的 HTML
        const { data } = await axios.get('https://www.google.com/finance/?hl=zh-TW');
        
        // 檢查 HTML 資料是否更新
        if (data === lastGoogleFinanceData) {
            // 如果資料沒有變化，則不進行任何操作
            return;
        }

        // 更新 lastGoogleFinanceData 為當前抓取到的 HTML 資料
        lastGoogleFinanceData = data;

        // 2. 使用 cheerio 來解析 HTML
        const $ = cheerio.load(data);

        // 3. 選擇要提取的元素（這裡我們選擇新聞標題）
        const newsTitles = [];
        $('.Yfwt5').each((index, element) => {
            let title = $(element).text().trim();
            title = highlightKeywords(title, chalk); // 使用 highlightKeywords 函數
            newsTitles.push(title);
        });

        // 4. 在控制台打印結果
        console.log(chalk.yellow('Google Finance 新聞標題:'));
        newsTitles.forEach((title, index) => {
            console.log(`${index + 1}. ${title}`);
            console.log(''); // 插入空行以模擬行距
        });
    } catch (error) {
        console.error('抓取 Google Finance 資料時發生錯誤:', error);
    }
}

(async () => {
    // 動態導入 chalk
    const chalk = (await import('chalk')).default;
    // 先立即執行一次爬蟲
    await fetchNewsTitles(chalk);
    await fetchGoogleFinanceNews(chalk);
    // 每 5 分鐘（300000 毫秒）檢查一次資料
    setInterval(() => fetchNewsTitles(chalk), 300000);
    setInterval(() => fetchGoogleFinanceNews(chalk), 300000);
})();





