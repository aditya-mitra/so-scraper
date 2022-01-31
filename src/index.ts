import superAgent from 'superagent';
import cheerio from 'cheerio';

const BASE_URL = 'https://stackoverflow.com';

async function getUrlsFromPage(pageNo: number): Promise<string[]> {
	const dom = await superAgent
		.get(`${BASE_URL}/questions?page=${pageNo}`)
		.then((response) => response.text)
		.catch((err: superAgent.ResponseError) => {
			console.log('encountered error ', err.message);
			return null;
		});

	if (!dom) {
		return [];
	}

	const $ = cheerio.load(dom);
	const urls: string[] = [];

	$('.question-summary .summary h3 a').each((_i, el) => {
		urls.push(el.attribs['href']);
	});

	return urls;
}

async function getDataFromUrl(url: string) {
    
}

async function addUrlsToDatabase(urls: string[]) {
	for (let i = 0; i < urls.length; ++i) {
		const group: Promise<void>[] = [];
		for (let j = 0; j < urls.length && j < 5; ++j) {
			// concurrently scrape the pages in groups of 5
			group.push(getDataFromUrl(urls[i + j]));
		}

        await Promise.all(group);
	}
}

async function main() {
	for (let pageNo = 1; pageNo <= 1; ++pageNo) {
		const urls = await getUrlsFromPage(pageNo);
	}
}

main();
