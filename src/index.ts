import superAgent from 'superagent';
import cheerio from 'cheerio';
import { createSpinner } from 'nanospinner';
import yesno from 'yesno';

import {
	connectToDB,
	incrementedEncountered,
	Scrape,
	updateLatestScrape,
} from './db';
import { createCSV } from './csv';

const BASE_URL = 'https://stackoverflow.com';
const PAGE_SIZE = 50;

interface IPageDetail {
	url: string;
	upvotes: number;
	answers: number;
}

async function getDetailsFromPage(pageNo: number): Promise<IPageDetail[]> {
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
	const pageDetails: IPageDetail[] = [];

	$('.question-summary').each((_i, el) => {
		const url = $(el).find('.summary h3 a').attr('href') ?? '';
		const upvotes = parseInt(
			$(el).find('.stats .vote .votes strong').text()
		);
		const answers = parseInt($(el).find('.stats .status strong').text());

		pageDetails.push({
			url: BASE_URL + url,
			upvotes,
			answers,
		});
	});

	return pageDetails;
}

async function storeDetailsInDB({ url, answers, upvotes }: IPageDetail) {
	const foundScrape = await Scrape.findOne(
		{ url },
		{ _id: 1 },
		{ lean: true }
	);

	if (!foundScrape) {
		const newScrape = new Scrape({ url, answers, upvotes });
		await newScrape.save().catch(async () => {
			await incrementedEncountered(url);
		});
	} else {
		await updateLatestScrape(foundScrape._id, answers, upvotes);
	}
}

async function main() {
	await connectToDB();

	const deleteScrapes = await yesno({
		question:
			'Do you want to delete previous entries in the database? (y/n)',
	});

	if (deleteScrapes) {
		await Scrape.deleteMany({});
	}

	const spinner = createSpinner();

	for (let i = 0; i <= 1; ++i) {
		// change to while(true)

		const pagesDetailPromises: Promise<IPageDetail[]>[] = [];

		for (let pageNo = i * 5 + 1; pageNo <= (i + 1) * 5; ++pageNo) {
			pagesDetailPromises.push(getDetailsFromPage(pageNo));
		}

		spinner.start({
			text: `Scraping pages ${i * 5 + 1} to ${(i + 1) * 5}`,
		});

		const pagesDetails = await Promise.all(pagesDetailPromises);
		spinner.success({
			text: `Successfully scraped pages ${i * 5 + 1} to ${(i + 1) * 5}`,
		});

		const storeDetailsPromises = ([] as IPageDetail[])
			.concat(...pagesDetails)
			.map((pageDetails) => storeDetailsInDB(pageDetails));

		spinner.start({
			text: `Storing scraped details into database`,
		});

		await Promise.all(storeDetailsPromises);

		spinner.success({
			text: `Successfully stored scraped details into database`,
			mark: '💽',
		});
	}

	await createCSV();

	process.exit(0);
}

process.on('SIGINT', async () => {
	await createCSV();
	process.exit(0);
});

main();
