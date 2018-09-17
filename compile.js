const path = require ('path');
const fs = require ('fs');
const solc = require ('solc');


const casinoPath = path.resolve(__dirname, 'contracts', 'Casino.sol');

const source = fs.readFileSync(casinoPath,'utf8');

console.log(solc.compile(source, 1).contracts[':Casino'].interface);

module.exports = solc.compile(source, 1).contracts[':Casino'];
