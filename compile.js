const path = require('path');
const fs = require('fs');
const solc = require('solc')

//ensures the module works both on windows and linux based systems
const lotteryPath = path.resolve(__dirname, 'contracts', 'Lottery.sol');
const source = fs.readFileSync(lotteryPath, 'utf-8');


module.exports = solc.compile(source, 1).contracts[':Lottery'];
