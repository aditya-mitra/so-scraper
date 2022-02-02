import superAgent from 'superagent';
import cheerio from 'cheerio';

const BASE_URL = 'https://stackoverflow.com';
const PAGE_SIZE = 50;

interface PageDetail {
	url: string;
	upvotes: number;
	answers: number;
}

async function getDetailsFromPage(pageNo: number): Promise<PageDetail[]> {
	const dom = await superAgent
		.get(`${BASE_URL}/questions`)
		.query({ page: pageNo, pagesize: PAGE_SIZE })
		.then((response) => response.text)
		.catch((err: superAgent.ResponseError) => {
			console.log('encountered error ', err.message);
			return null;
		});

	if (!dom) {
		return []; // throw error here instead of return
	}

	const $ = cheerio.load(dom);
	const pageDetails: PageDetail[] = [];

	$('.question-summary').each((_i, el) => {
		const url = $(el).find('.summary h3 a').attr('href') ?? '';
		const upvotes = parseInt(
			$(el).find('.stats .vote .votes strong').text()
		);
		const answers = parseInt($(el).find('.stats .status strong').text());

		pageDetails.push({
			url,
			upvotes,
			answers,
		});
	});

	return pageDetails;
}

async function storeDetailsInDatabase(pageDetails: PageDetail[]) {}

async function main() {
	for (let i = 0; i <= 1; ++i) {
		// change to while(true)

		const pageDetailPromises: Promise<PageDetail[]>[] = [];

		for (let pageNo = i * 5 + 1; pageNo <= (i + 1) * 5; ++pageNo) {
			pageDetailPromises.push(getDetailsFromPage(pageNo));
		}

		const pageDetails = await Promise.all(pageDetailPromises);
		console.log(pageDetails);
	}
}

main();

/*async function addUrlsToDatabase(urls: string[]) {
	for (let i = 0; i < urls.length; ++i) {
		const group: Promise<void>[] = [];
		for (let j = 0; j < urls.length && j < 5; ++j) {
			// concurrently scrape the pages in groups of 5
			group.push(getDataFromUrl(urls[i + j]));
		}

		await Promise.all(group);
	}
}*/
