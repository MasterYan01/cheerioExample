const puppeteer = require('puppeteer');

(async () => {
  // 啟動無頭瀏覽器
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // 瀏覽目標頁面
  await page.goto('https://tw.news.yahoo.com/finance/');

  // 等待新聞列表載入
  await page.waitForSelector('li.js-stream-content');

  // 抓取新聞標題和連結
  const newsData = await page.evaluate(() => {
    const articles = document.querySelectorAll('li.js-stream-content');
    let result = [];

    articles.forEach(article => {
      const titleElement = article.querySelector('h3 a');
      const title = titleElement ? titleElement.innerText : null;
      const link = titleElement ? titleElement.href : null;

      if (title && link) {
        result.push({ title, link });
      }
    });

    return result;
  });

  // 美化和整理新聞內容輸出
  console.log('Yahoo 財經新聞：');
  console.log('-----------------------------');
  newsData.forEach((news, index) => {
    console.log(`${index + 1}. ${news.title}`);
    console.log(`   連結: ${news.link}`);
    console.log('-----------------------------');
  });

  // 關閉瀏覽器
  await browser.close();
})();



