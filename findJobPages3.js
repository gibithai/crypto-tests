const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

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

// Функция для проверки наличия страниц "Jobs", "Careers" или "Hiring"
const checkJobsOrCareers = async (url) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br'
      }
    });
    const $ = cheerio.load(response.data);
    
    // Проверка наличия ссылок на страницы с ключевыми словами
    const jobsLink = $('a[href*="jobs"], a[href*="careers"], a[href*="hiring"]').length > 0;
    return jobsLink ? url : null;
  } catch (error) {
    console.error(`Error accessing ${url}:`, error.message);
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

    for (const [symbol, crypto] of Object.entries(cryptoInfo)) {
      const websiteUrl = crypto.urls && crypto.urls.website ? crypto.urls.website[0] : null;
      if (websiteUrl) {
        const jobPage = await checkJobsOrCareers(websiteUrl);
        if (jobPage) {
          relevantResults.push(jobPage);
        }
      }
    }

    // Запись в файл и вывод на консоль
    const resultsFile = 'relevant_job_pages.txt';
    fs.writeFileSync(resultsFile, relevantResults.join('\n') + '\n');
    console.log('Relevant job pages saved to', resultsFile);

  } catch (error) {
    console.error('Error fetching data:', error.message);
  }
};

findJobPages();
