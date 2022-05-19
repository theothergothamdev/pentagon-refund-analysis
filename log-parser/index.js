const fs = require('fs');

const parseWalletLine = line => line.replace("['", '').replace("']", '');
const peak = arr => arr[0];
const isWalletLine = line => line.startsWith("['0x");

function findDuplicates(entries) {
  const occurances = {};

  for (const entry of entries) {
    if (!occurances[entry.walletAddress]) {
      occurances[entry.walletAddress] = 0;
    }

    occurances[entry.walletAddress] = occurances[entry.walletAddress] + 1;
  }
  const duplicates = [];

  for (const [walletAddress, count] of Object.entries(occurances)) {
    if (count > 1) {
      duplicates.push(walletAddress);
    }
  }
  return duplicates;
}

function findTotalRefundsIssued(entries) {
  return entries.reduce((prev, curr) => curr.refundTotal + prev, 0);
}

function findUniqueWalletCount(entries) {
  const uniqueWallets = new Set(entries.map(entry => entry.walletAddress));
  return uniqueWallets.size;
}

function parseWalletBlock(walletAddress, walletBlock) {
  console.warn('Processing Block', walletBlock);

  const walletSummary = {};
  let refundTotal = 0;
  let txns = [];
  while (walletBlock.length > 0) {
    const line = walletBlock.shift();
    if (line.startsWith('refunded')) {
      const parts = line.split(' ');
      refundTotal += parseInt(parts[1]);
      txns.push(parts[8]);
    }
  }

  walletSummary.walletAddress = walletAddress;
  walletSummary.txns = txns;
  walletSummary.refundTotal = refundTotal;
  return walletSummary;
}

function parseLogs(logs) {
  const summary = {
    refunded: [],
    notRefunded: [],
  };

  while (logs.length > 0) {
    const line = logs.shift();
    if (isWalletLine(line)) {
      const walletAddress = parseWalletLine(line);
      const block = [line];

      while (true) {
        if (logs.length === 0 || isWalletLine(peak(logs))) {
          const walletSummary = parseWalletBlock(walletAddress, block);
          if (walletSummary.refundTotal > 0) {
            summary.refunded.push(walletSummary);
          } else {
            summary.notRefunded.push(walletSummary);
          }
          break;
        }

        block.push(logs.shift());
      }
    }
  }

  summary.totalRefundsIssued = findTotalRefundsIssued(summary.refunded);
  summary.totalWalletsNotRefunded = findUniqueWalletCount(summary.notRefunded);
  summary.totalWalletsRefunded = findUniqueWalletCount(summary.refunded);
  summary.totalWallets = summary.totalWalletsNotRefunded + summary.totalWalletsRefunded;
  summary.refunded = summary.refunded.sort((a, b) => b.refundTotal - a.refundTotal);
  summary.duplicates = findDuplicates(summary.refunded);
  return summary;
}

const logFile = fs.readFileSync('logs.txt', { encoding: 'utf-8' });
const logs = logFile.split('\n');
const summary = parseLogs(logs);
console.log(summary);

fs.writeFileSync('summary.json', JSON.stringify(summary, null, 2));
