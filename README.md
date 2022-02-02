
# SO Scraper

A Script to scrape questions from [stackoverflow.com](https://stackoverflow.com/questions) and export them into a CSV file.


## Usage

_Note:_ Make sure you have **NodeJS >= 16** installed in your machine.

You will need a MongoDB database. Paste the connection uri to your MongoDB as demonstrated in [.env.example](./.env.example) into a `.env` file

You can then run the following script:

```bash
git clone https://github.com/aditya-mitra/so-scraper.git
yarn install
yarn start
```

## Demo

![gif__play](https://drive.google.com/uc?export=view&id=1ZehVEPxVtug-I6yv8dfdkMFgsgZ29m8O)

**You can also view the full video [here](https://drive.google.com/file/d/1xi24i8pTFnnbqGnr4udEuOf6VfnUldLm/view?usp=sharing)**

## Tech Stack

- NodeJS
- MongoDB
- TypeScript
- Cheerio
- SuperAgent


## Authors

- [@aditya-mitra](https://aditya-mitra.github.io/)


## License

```
MIT License

Copyright (c) 2022 Aditya Mitra

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

```
