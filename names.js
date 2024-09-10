const axios = require('axios');
const cheerio = require('cheerio');

const baseUrl = 'https://coinmarketcap.com/';

const fetchProjectUrls = async (pageNumber) => {
  const url = `${baseUrl}?page=${pageNumber}`;
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Referer': 'https://www.google.com/',
      }
    });
    const $ = cheerio.load(response.data);
    const projectUrls = [];

    $('a.cmc-link').each((index, element) => {
      const websiteUrl = $(element).attr('href');
      if (websiteUrl && websiteUrl.includes('/currencies/')) {
        projectUrls.push(`${baseUrl}${websiteUrl}`);
      }
    });

    return projectUrls;
  } catch (error) {
    console.error(`Error fetching page ${pageNumber}:`, error.message);
    return [];
  }
};

const checkJobsOrCareers = async (url) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Referer': 'https://www.google.com/',
      }
    });
    const $ = cheerio.load(response.data);

    const jobsLink = $('a[href*="jobs"], a[href*="careers"], a[href*="hiring"]').length > 0;
    return jobsLink ? url : null;
  } catch (error) {
    console.error(`Error accessing ${url}:`, error.message);
    return null;
  }
};

const findJobPages = async () => {
  let allProjectUrls = [];

  for (let pageNumber = 1; pageNumber <= 2; pageNumber++) {
    const projectUrls = await fetchProjectUrls(pageNumber);
    allProjectUrls = allProjectUrls.concat(projectUrls);
  }

  const relevantResults = [];

  for (const projectUrl of allProjectUrls) {
    const jobPage = await checkJobsOrCareers(projectUrl);
    if (jobPage) {
      console.log(`Relevant page found: ${jobPage}`);
      relevantResults.push(jobPage);
    }
  }

  console.log('All relevant results:', relevantResults);
};

findJobPages();
