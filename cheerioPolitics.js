const axios = require('axios');
const cheerio = require('cheerio');

let lastData = {}; // 儲存每個網站的 HTML 資料

async function fetchNewsTitles(chalk) {
    const urls = [
        { url: 'https://news.google.com/topics/CAAqKggKIiRDQkFTRlFvSUwyMHZNRGx6TVdZU0JYcG9MVlJYR2dKVVZ5Z0FQAQ?hl=zh-TW&gl=TW&ceid=TW%3Azh-Hant', label: '財經新聞' }
    ];

    try {
        for (const { url, label } of urls) {
            // 使用 axios 發送 GET 請求來獲取每個網站的 HTML
            const { data } = await axios.get(url);
            
            // 檢查 HTML 資料是否更新
            if (data === lastData[url]) {
                // 如果資料沒有變化，則不進行任何操作
                continue;
            }

            // 更新 lastData 為當前抓取到的 HTML 資料
            lastData[url] = data;

            // 使用 cheerio 來解析 HTML
            const $ = cheerio.load(data);

            // 選擇要提取的元素（這裡我們選擇新聞標題）
            const titles = [];
            // 假設標題的選擇器是 '.xrnccd .nuEeue' (這是根據實際網站的 HTML 結構來調整的)
            $('.xrnccd .nuEeue').each((index, element) => {
                let title = $(element).find('a').text().trim();
                // 將「柯文哲」和「台積電」字樣用紅色顯示
                title = title
                    .replace(/柯文哲/g, (match) => chalk.red(match))
                    .replace(/台積電/g, (match) => chalk.red(match));
                titles.push(title);
            });

            // 在控制台打印結果
            console.log(chalk.yellow(`${label} (${url}):`));
            titles.forEach((title, index) => {
                console.log(`${index + 1}. ${title}`);
                console.log(''); // 插入空行以模擬行距
            });
        }
    } catch (error) {
        console.error('抓取資料時發生錯誤:', error);
    }
}

(async () => {
    // 動態導入 chalk
    const chalk = (await import('chalk')).default;
    // 先立即執行一次爬蟲
    await fetchNewsTitles(chalk);
    // 每 5 分鐘（300000 毫秒）檢查一次資料
    setInterval(() => fetchNewsTitles(chalk), 300000);
})();
