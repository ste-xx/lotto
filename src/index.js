import parse from "csv-parse";
import {promises as fs} from "fs";
import {join, dirname} from 'path';
import {fileURLToPath} from 'url';
import stringify from 'csv-stringify';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const readResourceFile = async (filename) => fs.readFile(join(__dirname, '..', 'res', filename), 'utf-8');
const writeGenFile = async (filename, data) => fs.writeFile(join(__dirname, '..', 'gen', filename), data)

const fromCSV = async (input) => new Promise(resolve => parse(input, {
  delimiter: ',',
  columns: true,
  trim: true
}, (err, out) => resolve(out)));

const toCSV = async (arr) => new Promise(resolve => stringify(arr, {
  header: true,
  columns: Object.keys(arr[0])
}, (err, data) => resolve(data)));

const withAdditionalField = ({arr, fn}) => arr.map(a => ({...(fn(a)), ...a}))


const compareNumbers = (a,b) => {
  if(a > b){
    return 1;
  } else if(a < b){
    return -1;
  } else {
    return 0;
  }
};

const mapNumbers = (obj) => {
  const n = [
    parseInt(obj['number-1'], 10),
    parseInt(obj['number-2'], 10),
    parseInt(obj['number-3'], 10),
    parseInt(obj['number-4'], 10),
    parseInt(obj['number-5'], 10)
  ].sort(compareNumbers);

  const ez = [
    parseInt(obj['euro-number-1'], 10),
    parseInt(obj['euro-number-2'], 10)
  ].sort(compareNumbers);

  return `${n[0]}-${n[1]}-${n[2]}-${n[3]}-${n[4]}:${ez[0]}:${ez[1]}`;
}

const createId = (a) => crypto.createHash('md5').update(JSON.stringify(a)).digest('hex')

const calcWinnerClass = (numberOfMatchesFiveNumbers, numberOfMatchedEzNumbers) => {
  if(numberOfMatchesFiveNumbers === 5 && numberOfMatchedEzNumbers === 2) return 1;
  else if(numberOfMatchesFiveNumbers === 5 && numberOfMatchedEzNumbers === 1) return 2;
  else if(numberOfMatchesFiveNumbers === 5 && numberOfMatchedEzNumbers === 0) return 3;
  else if(numberOfMatchesFiveNumbers === 4 && numberOfMatchedEzNumbers === 2) return 4;
  else if(numberOfMatchesFiveNumbers === 4 && numberOfMatchedEzNumbers === 1) return 5;
  else if(numberOfMatchesFiveNumbers === 4 && numberOfMatchedEzNumbers === 0) return 6;
  else if(numberOfMatchesFiveNumbers === 3 && numberOfMatchedEzNumbers === 2) return 7;
  else if(numberOfMatchesFiveNumbers === 2 && numberOfMatchedEzNumbers === 2) return 8;
  else if(numberOfMatchesFiveNumbers === 3 && numberOfMatchedEzNumbers === 1) return 9;
  else if(numberOfMatchesFiveNumbers === 3 && numberOfMatchedEzNumbers === 0) return 10;
  else if(numberOfMatchesFiveNumbers === 1 && numberOfMatchedEzNumbers === 2) return 11;
  else if(numberOfMatchesFiveNumbers === 2 && numberOfMatchedEzNumbers === 1) return 12;
  else return 13;
};

const findBestMatch = (arr, fiveNumbers, ezNumbers) => {
  const newArr = withAdditionalField({
    arr,
    fn: (obj) => {
      return {
        numberSet: new Set([
          parseInt(obj['number-1'], 10),
          parseInt(obj['number-2'], 10),
          parseInt(obj['number-3'], 10),
          parseInt(obj['number-4'], 10),
          parseInt(obj['number-5'], 10)
        ]),
        numberSetEz: new Set([
          parseInt(obj['euro-number-1'], 10),
          parseInt(obj['euro-number-2'], 10)
        ])
      }
    }
  });
  return newArr.reduce((acc, {id, numberSet,numberSetEz, numbers}) => {
    const numberOfMatchesFiveNumbers = fiveNumbers.reduce((acc, cur)=> acc + (numberSet.has(cur) ? 1 : 0), 0);
    const numberOfMatchedEzNumbers = ezNumbers.reduce((acc, cur)=> acc + (numberSetEz.has(cur) ? 1 : 0), 0);

    const winnerClass = calcWinnerClass(numberOfMatchesFiveNumbers, numberOfMatchedEzNumbers);

    return winnerClass > acc.winnerClass ? acc : {
      id,
      winnerClass,
      numberOfMatchesFiveNumbers,
      numberOfMatchedEzNumbers,
      numbers,
      fiveNumbers,
      ezNumbers
    }
  }, {winnerClass: 13, id: "-1"});
};

await (async () => {


  const csv = [
    withAdditionalField({
      arr: await fromCSV(await readResourceFile('Eurojackpot - 2012.csv')),
      fn: (a) => ({id: createId(a), year: '2012', numbers: mapNumbers(a)})
    }),
    withAdditionalField({
      arr: await fromCSV(await readResourceFile('Eurojackpot - 2013.csv')),
      fn: (a) => ({id: createId(a), year: '2013', numbers: mapNumbers(a)})
    }),
    withAdditionalField({
      arr: await fromCSV(await readResourceFile('Eurojackpot - 2014.csv')),
      fn: (a) => ({id: createId(a), year: '2014', numbers: mapNumbers(a)})
    }),
    withAdditionalField({
      arr: await fromCSV(await readResourceFile('Eurojackpot - 2015.csv')),
      fn: (a) => ({id: createId(a), year: '2015', numbers: mapNumbers(a)})
    }),
    withAdditionalField({
      arr: await fromCSV(await readResourceFile('Eurojackpot - 2016.csv')),
      fn: (a) => ({id: createId(a), year: '2016', numbers: mapNumbers(a)})
    }),
    withAdditionalField({
      arr: await fromCSV(await readResourceFile('Eurojackpot - 2017.csv')),
      fn: (a) => ({id: createId(a), year: '2017', numbers: mapNumbers(a)})
    }),
    withAdditionalField({
      arr: await fromCSV(await readResourceFile('Eurojackpot - 2018.csv')),
      fn: (a) => ({id: createId(a), year: '2018', numbers: mapNumbers(a)})
    }),
    withAdditionalField({
      arr: await fromCSV(await readResourceFile('Eurojackpot - 2019.csv')),
      fn: (a) => ({id: createId(a), year: '2019', numbers: mapNumbers(a)})
    }),
  ].flat();

  const bestResult = findBestMatch(csv, [11,20,38,41,44], [4,7]);
  console.warn(bestResult);

  await Promise.all([
    writeGenFile('eurojackpot-2012-2019.json', JSON.stringify(csv, null, 2)),
    writeGenFile('eurojackpot-2012-2019.csv', await toCSV(csv))
  ]);
})();

await (async () => {
  const csv = [
    withAdditionalField({
      arr: await fromCSV(await readResourceFile('EJ_ab_2020 - 2020.csv')),
      fn: (a) => ({id: createId(a), year: '2020', numbers: mapNumbers(a)})
    }),
    withAdditionalField({
      arr: await fromCSV(await readResourceFile('EJ_ab_2020 - 2021.csv')),
      fn: (a) => ({id: createId(a), year: '2021', numbers: mapNumbers(a)})
    })
  ].flat();

  const bestResult = findBestMatch(csv, [11,20,38,41,44], [4,7]);
  console.warn(bestResult);

  await Promise.all([
    writeGenFile('eurojackpot.json', JSON.stringify(csv, null, 2)),
    writeGenFile('eurojackpot.csv', await toCSV(csv))
  ]);
})();

await (async () => {


});
