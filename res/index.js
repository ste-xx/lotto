import parse from "csv-parse";
import generate from "csv-generate";
import {promises as fs} from "fs";
import {join, dirname} from 'path';
import {fileURLToPath} from 'url';
import stringify from 'csv-stringify';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const readFile = async (filename) => fs.readFile(join(__dirname, filename), 'utf-8');

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


await (async () => {

  const mapNumbers = (obj) => {
    const n = [
      parseInt(obj['number-1'], 10),
      parseInt(obj['number-2'], 10),
      parseInt(obj['number-3'], 10),
      parseInt(obj['number-4'], 10),
      parseInt(obj['number-5'], 10)
    ].sort((a,b) => {
      if(a > b){
        return 1;
      } else if(a < b){
        return -1;
      } else {
        return 0;
      }
    });
    const ez = [
      parseInt(obj['euro-number-1'], 10),
      parseInt(obj['euro-number-2'], 10)
    ].sort((a,b) => {
      if(a > b){
        return 1;
      } else if(a < b){
        return -1;
      } else {
        return 0;
      }
    });
    return `${n[0]}-${n[1]}-${n[2]}-${n[3]}-${n[4]}:${ez[0]}:${ez[1]}`;
  }

  const csv = [
    withAdditionalField({
      arr: await fromCSV(await readFile('Eurojackpot - 2012.csv')),
      fn: (a) => ({year: '2012', numbers: mapNumbers(a)})
    }),
    withAdditionalField({
      arr: await fromCSV(await readFile('Eurojackpot - 2013.csv')),
      fn: (a) => ({year: '2013', numbers: mapNumbers(a)})
    }),
    withAdditionalField({
      arr: await fromCSV(await readFile('Eurojackpot - 2014.csv')),
      fn: (a) => ({year: '2014', numbers: mapNumbers(a)})
    }),
    withAdditionalField({
      arr: await fromCSV(await readFile('Eurojackpot - 2015.csv')),
      fn: (a) => ({year: '2015', numbers: mapNumbers(a)})
    }),
    withAdditionalField({
      arr: await fromCSV(await readFile('Eurojackpot - 2016.csv')),
      fn: (a) => ({year: '2016', numbers: mapNumbers(a)})
    }),
    withAdditionalField({
      arr: await fromCSV(await readFile('Eurojackpot - 2017.csv')),
      fn: (a) => ({year: '2017', numbers: mapNumbers(a)})
    }),
    withAdditionalField({
      arr: await fromCSV(await readFile('Eurojackpot - 2018.csv')),
      fn: (a) => ({year: '2018', numbers: mapNumbers(a)})
    }),
    withAdditionalField({
      arr: await fromCSV(await readFile('Eurojackpot - 2019.csv')),
      fn: (a) => ({year: '2019', numbers: mapNumbers(a)})
    }),
  ].flat();

  await fs.writeFile(join(__dirname, 'gen.csv'), await toCSV(csv));
})();
