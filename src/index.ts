import superAgent from 'superagent';
import cheerio from 'cheerio';
import yesno from 'yesno';
import { createSpinner } from 'nanospinner';

import { connectToDB, bulkIncrementEncountered, Scrape } from './db';
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
			throw new Error('during getDetailsFromPage, ' + err.message);
		});

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

async function main() {
	await connectToDB();

	const deleteScrapes = await yesno({
		question:
			'Do you want to delete previous entries in the database? (y/n)',
	});

	const spinner = createSpinner();
	if (deleteScrapes) {
		spinner.start({ text: 'deleting scrape entries' });
		await Scrape.deleteMany({});
		spinner.success({ text: 'successfully deleted scrape entries' });
	}

	let i = 0;

	while (true) {
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

		const storeDetailsPromises = ([] as IPageDetail[]).concat(
			...pagesDetails
		);

		spinner.start({
			text: `Storing scraped details into database`,
		});

		await Scrape.insertMany(storeDetailsPromises, { ordered: false }).catch(
			async (err) => {
				const duplicateUrls: string[] =
					err.result.result.writeErrors.map(
						(writeError: any) => writeError.err.op.url
					);

				await bulkIncrementEncountered(duplicateUrls);
			}
		);

		spinner.success({
			text: `Successfully stored scraped details into database`,
			mark: '💽',
		});

		++i;
	}
}

process.on('SIGINT', () => {
	createCSV().then(() => {
		process.exit(0);
	});
});

main();
