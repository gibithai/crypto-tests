const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// Функция для получения всех страниц с проектами
const fetchCryptoUrls = async (pageNumber) => {
  try {
    const response = await axios.get(`https://coinmarketcap.com/?page=${pageNumber}`);
    const $ = cheerio.load(response.data);
    const urls = [];
    $('a.cmc-link').each((_, el) => {
      const href = $(el).attr('href');
      if (href && href.startsWith('/currencies/')) {
        urls.push(`https://coinmarketcap.com${href}`);
      }
    });
    return urls;
  } catch (error) {
    console.error(`Error fetching URLs from page ${pageNumber}:`, error.message);
    return [];
  }
};

// Функция для проверки наличия страниц с ключевыми словами
const checkKeywordsOnPage = async (url) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const hasJobsPage = $('a[href*="jobs"]').length > 0;
    const hasCareersPage = $('a[href*="careers"]').length > 0;
    const hasHiringPage = $('a[href*="hiring"]').length > 0;

    return hasJobsPage || hasCareersPage || hasHiringPage ? url : null;
  } catch (error) {
    console.error(`Error checking keywords on ${url}:`, error.message);
    return null;
  }
};

// Основная функция для получения и проверки ссылок
const findJobPages = async () => {
  const urlsFile = 'crypto_jobs_results.txt';
  const pageNumbers = [1, 2]; // Указываем страницы для проверки

  const allUrls = [];
  
  for (const pageNumber of pageNumbers) {
    console.log(`Fetching project URLs from page ${pageNumber}`);
    const urls = await fetchCryptoUrls(pageNumber);
    allUrls.push(...urls);
  }

  const relevantUrls = [];
  for (const url of allUrls) {
    console.log(`Checking keywords on ${url}`);
    const result = await checkKeywordsOnPage(url);
    if (result) {
      relevantUrls.push(result);
    }
  }

  // Записываем все подходящие URL в файл
  fs.writeFileSync(urlsFile, relevantUrls.join('\n') + '\n');
  console.log('All relevant pages:', relevantUrls);
};

findJobPages();
