const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// Импортируем p-limit через динамический import
(async () => {
  const pLimit = (await import('p-limit')).default;

  // Базовые параметры API
  const baseURL = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest';
  const apiKey = '4cde1d72-577c-44ae-91ac-8d84d491c41e';
  const options = {
    headers: {
      'X-CMC_PRO_API_KEY': apiKey
    }
  };

  // Функция для получения детальной информации о криптовалютах (разделяем запросы на части)
  const fetchCryptoInfo = async (symbolsArray) => {
    const results = {};
    for (const symbols of symbolsArray) {
      try {
        const response = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/info', {
          ...options,
          params: { symbol: symbols }
        });
        Object.assign(results, response.data.data);
      } catch (error) {
        console.error('Error fetching cryptocurrency info:', error.message);
      }
    }
    return results;
  };

  // Функция для разбивки массива символов на несколько частей (например, по 50 символов)
  const chunkArray = (array, size) => {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size).join(','));
    }
    return result;
  };

  // Функция для проверки наличия страниц "Jobs", "Careers" или "Hiring" и поиска ключевых слов
  const checkJobsOrCareersAndKeywords = async (url) => {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        }
      });
      const $ = cheerio.load(response.data);
      
      const jobLinks = $('a[href*="jobs"], a[href*="careers"], a[href*="hiring"]').map((i, link) => $(link).attr('href')).get();

      for (const link of jobLinks) {
        const absoluteLink = link.startsWith('http') ? link : `${url}/${link}`;
        const jobPageResponse = await axios.get(absoluteLink, {
          headers: {
            'User-Agent': 'Mozilla/5.0',
          }
        });
        const jobPage = cheerio.load(jobPageResponse.data);
        
        const relevantSection = jobPage('body').text().toLowerCase();
        const keywords = ['QA', 'QA Lead', 'Tester', 'Quality Assurance'];
        const hasKeywords = keywords.some(keyword => relevantSection.includes(keyword.toLowerCase()));
        
        if (hasKeywords) {
          return absoluteLink; 
        }
      }

      return null;
    } catch (error) {
      if (error.response && (error.response.status === 403 || error.response.status === 404)) {
        console.warn(`Error accessing ${url}: Request failed with status code ${error.response.status}`);
      } else {
        console.error(`Error accessing ${url}:`, error.message);
      }
      return null;
    }
  };

  // Функция для получения списка криптовалют с нескольких страниц
  const fetchAllCryptoData = async (pages) => {
    let allData = [];
    for (let page = 1; page <= pages; page++) {
      try {
        const response = await axios.get(baseURL, {
          ...options,
          params: { start: (page - 1) * 100 + 1, limit: 100 } 
        });
        allData = allData.concat(response.data.data);
      } catch (error) {
        console.error(`Error fetching data from page ${page}:`, error.message);
      }
    }
    return allData;
  };

  // Основная функция для получения сайтов и проверки страниц "Jobs" или "Careers"
  const findJobPages = async () => {
    try {
      const pagesToFetch = 20; 
      const allCryptos = await fetchAllCryptoData(pagesToFetch);
      const symbols = allCryptos.map(crypto => crypto.symbol);

      // Разделение символов на части (по 50 символов за раз)
      const chunkedSymbols = chunkArray(symbols, 50);

      const cryptoInfo = await fetchCryptoInfo(chunkedSymbols);
      const relevantResults = [];

      const limit = pLimit(5); 

      const tasks = Object.entries(cryptoInfo).map(([symbol, crypto]) => limit(async () => {
        const websiteUrl = crypto.urls && crypto.urls.website ? crypto.urls.website[0] : null;
        if (websiteUrl) {
          const jobPage = await checkJobsOrCareersAndKeywords(websiteUrl);
          if (jobPage) {
            relevantResults.push(jobPage);
          }
        }
      }));

      await Promise.all(tasks);

      const resultsFile = 'relevant_job_pages.txt';
      fs.writeFileSync(resultsFile, relevantResults.join('\n') + '\n');
      console.log('Relevant job pages saved to', resultsFile);

    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  findJobPages();
})();
