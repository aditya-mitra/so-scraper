import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

export async function connectToDB(): Promise<void> {
	return new Promise((resolve, reject) => {
		console.log('attempting connection to database');

		const uri = process.env.ATLAS_URI;
		if (!uri) {
			console.log('MONGO ALTAS URI not found');
			return reject();
		}

		mongoose
			.connect(uri)
			.then(() => {
				console.log('connection to database successful!');
				resolve();
			})
			.catch((e) => {
				console.log(e?.message);
				reject();
			});
	});
}

interface ISrape {
	url: String;
	enountered: Number;
	upvotes: Number;
	answers: Number;
}

const ScrapeSchema = new mongoose.Schema({
	url: { type: String, unique: true, required: true, trim: true },
	encountered: { type: Number, default: 0 },
	upvotes: { type: Number, required: true },
	answers: { type: Number, required: true },
});

export const Scrape = mongoose.model<ISrape>('Scrape', ScrapeSchema);

export async function updateLatestScrape(
	id: mongoose.Types.ObjectId,
	answers: number,
	upvotes: number
) {
	await Scrape.updateOne(
		{ _id: id },
		{
			// put the latest change of the answers and upvotes
			$set: {
				answers,
				upvotes,
			},
			$inc: {
				encountered: 1,
			},
		}
	);
}

export async function incrementedEncountered(url: string) {
	await Scrape.updateOne({ url }, { $inc: { encountered: 1 } });
}
