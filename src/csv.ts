import { writeFileSync } from 'fs';
import { Parser } from 'json2csv';
import {createSpinner} from 'nanospinner'

import { IScrape } from './db';

export function createCSV(scrapes: IScrape[]) {
    const spinner  = createSpinner();
    
    spinner.start({text:'creating CSV file'})
    
	const parser = new Parser();
	const csv = parser.parse(scrapes);

	writeFileSync('so-scraped.csv', csv, { encoding: 'utf-8' });

    spinner.success({text:'saved file as "so-scraped.csv"', mark:'📄'})
}
