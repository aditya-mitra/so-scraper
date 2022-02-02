import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createSpinner } from 'nanospinner';

dotenv.config();

export async function connectToDB(): Promise<void> {
	return new Promise((resolve, reject) => {
		const spinner = createSpinner();

		spinner.start({ text: 'attempting connection to database' });

		const uri = process.env.ATLAS_URI;
		if (!uri) {
			spinner.error({ text: 'ALTAS_URI not found in environment' });
			return reject();
		}

		mongoose
			.connect(uri)
			.then(() => {
				spinner.success({
					text: 'connection to database successful!',
					mark: '🪢',
				});
				resolve();
			})
			.catch((e) => {
				spinner.error({ text: e?.message });
				reject();
			});
	});
}

export interface IScrape {
	url: String;
	encountered: Number;
	upvotes: Number;
	answers: Number;
}

const ScrapeSchema = new mongoose.Schema({
	url: { type: String, unique: true, required: true, trim: true },
	encountered: { type: Number, default: 0 },
	upvotes: { type: Number, required: true },
	answers: { type: Number, required: true },
});

export const Scrape = mongoose.model<IScrape>('Scrape', ScrapeSchema);

export async function bulkIncrementEncountered(urls: string[]) {
	const bulkWriteOps = urls.map((url) => ({
		updateOne: {
			filter: { url },
			update: { $inc: { encountered: 1 } },
		},
	}));

	await Scrape.bulkWrite(bulkWriteOps).catch((err) => console.log(err));
}
