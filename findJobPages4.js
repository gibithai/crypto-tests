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

  // Функция для получения детальной информации о криптовалютах
  const fetchCryptoInfo = async (symbols) => {
    try {
      const response = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/info', {
        ...options,
        params: { symbol: symbols }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching cryptocurrency info:', error.message);
      return {};
    }
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
      
      // Ищем ссылки на страницы с ключевыми словами "jobs", "careers", "hiring"
      const jobLinks = $('a[href*="jobs"], a[href*="careers"], a[href*="hiring"]').map((i, link) => $(link).attr('href')).get();
      
      for (const link of jobLinks) {
        const absoluteLink = link.startsWith('http') ? link : `${url}/${link}`;
        const jobPageResponse = await axios.get(absoluteLink, {
          headers: {
            'User-Agent': 'Mozilla/5.0',
          }
        });
        const jobPage = cheerio.load(jobPageResponse.data);
        
        // Ищем ключевые слова на странице вакансий
        const keywords = ['QA', 'QA Lead', 'Tester', 'Quality Assurance'];
        const pageText = jobPage('body').text().toLowerCase();
        const hasKeywords = keywords.some(keyword => pageText.includes(keyword.toLowerCase()));
        
        if (hasKeywords) {
          return absoluteLink; // Возвращаем ссылку на страницу вакансий с ключевыми словами
        }
      }

      return null;
    } catch (error) {
      if (error.response && (error.response.status === 403 || error.response.status === 404)) {
        // Игнорируем ошибки 403 и 404
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
          params: { start: (page - 1) * 100 + 1, limit: 100 } // Разделение на страницы
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
      const pagesToFetch = 4; // Количество страниц для получения данных
      const allCryptos = await fetchAllCryptoData(pagesToFetch);
      const symbols = allCryptos.map(crypto => crypto.symbol).join(',');

      const cryptoInfo = await fetchCryptoInfo(symbols);
      const relevantResults = [];

      // Инициализация p-limit для ограничения параллельных запросов
      const limit = pLimit(5); // Одновременно не более 5 запросов

      const tasks = Object.entries(cryptoInfo).map(([symbol, crypto]) => limit(async () => {
        const websiteUrl = crypto.urls && crypto.urls.website ? crypto.urls.website[0] : null;
        if (websiteUrl) {
          const jobPage = await checkJobsOrCareersAndKeywords(websiteUrl);
          if (jobPage) {
            relevantResults.push(jobPage);
          }
        }
      }));

      // Ожидание выполнения всех задач
      await Promise.all(tasks);

      // Запись результатов в файл
      const resultsFile = 'relevant_job_pages.txt';
      fs.writeFileSync(resultsFile, relevantResults.join('\n') + '\n');
      console.log('Relevant job pages saved to', resultsFile);

    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  findJobPages();
})();
