// highlightKeywords.js

function highlightKeywords(title, chalk) {
  return title
      .replace(/鴻海/g, (match) => chalk.red(match))
      .replace(/台積電/g, (match) => chalk.blue(match))
      .replace(/AI/g, (match) => chalk.yellow(match))
      .replace(/廣達/g, (match) => chalk.green(match))
      .replace(/緯創/g, (match) => chalk.green(match))
      .replace(/輝達/g, (match) => chalk.green(match));
}

module.exports = highlightKeywords;
