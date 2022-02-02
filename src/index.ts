import superAgent from 'superagent';
import cheerio from 'cheerio';
import mongoose from 'mongoose';

import {
	connectToDB,
	incrementedEncountered,
	Scrape,
	updateLatestScrape,
} from './db';

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
	await Scrape.deleteMany({});
	
	console.log('before count = ', await Scrape.count());
	
	for (let i = 0; i <= 1; ++i) {
		// change to while(true)
		
		const pagesDetailPromises: Promise<IPageDetail[]>[] = [];
		
		for (let pageNo = i * 5 + 1; pageNo <= (i + 1) * 5; ++pageNo) {
			pagesDetailPromises.push(getDetailsFromPage(pageNo));
		}
		
		const pagesDetails = await Promise.all(pagesDetailPromises);
		const storeDetailsPromises = ([] as IPageDetail[])
		.concat(...pagesDetails)
		.map((pageDetails) => storeDetailsInDB(pageDetails));
		
		console.log('sracped count = ', storeDetailsPromises.length);
		
		await Promise.all(storeDetailsPromises);
		
		console.log('Scrape Model count = ', await Scrape.count());
	}
	
	const docs = await Scrape.find({ encountered: { $gte: 1 } }).count()
	console.log('encountered=', docs);
	
	process.exit(0);
}

main();
