import { writeFileSync } from 'fs';
import { Parser } from 'json2csv';

import { IScrape } from './db';

export function createCSV(scrapes: IScrape[]) {
	const parser = new Parser();
	const csv = parser.parse(scrapes);

	writeFileSync('so-scraped.csv', csv, { encoding: 'utf-8' });
}
