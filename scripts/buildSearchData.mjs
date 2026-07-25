import { generateSearchData } from './searchData.mjs';

generateSearchData()
  .then(datasets => {
    const counts = Object.fromEntries(
      Object.entries(datasets).map(([key, records]) => [key, records.length]),
    );
    console.log(JSON.stringify(counts, null, 2));
  })
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
