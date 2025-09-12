process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
 
import fetch from "node-fetch";
import fs from "fs";
import Decimal from "decimal.js";
 
const RATES_FILE = "rates.json";
const MINOR_UNITS_FILE = "minorUnits.json";
const API_URL = "https://open.er-api.com/v6/latest/USD";
 

const CRYPTO_API =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,ripple,litecoin,dogecoin,cardano,solana,polkadot,tron,avalanche-2,shiba-inu,chainlink,stellar,monero&vs_currencies=usd";
 
const cryptoMapping = {
  bitcoin: "BTC",
  ethereum: "ETH",
  ripple: "XRP",
  litecoin: "LTC",
  dogecoin: "DOGE",
  cardano: "ADA",
  solana: "SOL",
  polkadot: "DOT",
  tron: "TRX",
  "avalanche-2": "AVAX",
  "shiba-inu": "SHIB",
  chainlink: "LINK",
  stellar: "XLM",
  monero: "XMR",
};
 
const reverseCryptoMapping = Object.fromEntries(
  Object.entries(cryptoMapping).map(([k, v]) => [v, k])
);
 

async function loadRates() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
 
    if (!data || !data.rates) throw new Error("Invalid API response");
 
    const matrix = {};
    const symbols = Object.keys(data.rates);
    for (let from of symbols) {
      matrix[from] = {};
      for (let to of symbols) {
        matrix[from][to] = new Decimal(data.rates[to])
          .div(new Decimal(data.rates[from]))
          .toNumber();
      }
    }
 
    let minorUnits = {};
    if (fs.existsSync(MINOR_UNITS_FILE)) {
      minorUnits = JSON.parse(fs.readFileSync(MINOR_UNITS_FILE, "utf8"));
    } else {
      throw new Error("minorUnits.json missing. Please create it!");
    }
 
    const finalData = { rates: matrix, minorUnits };
    fs.writeFileSync(RATES_FILE, JSON.stringify(finalData, null, 2));
    console.log("Rates fetched from API and saved to rates.json");
 
    return finalData;
  } catch (err) {
    console.warn("API failed, using local JSON:", err.message);
    if (fs.existsSync(RATES_FILE)) {
      const fileData = JSON.parse(fs.readFileSync(RATES_FILE, "utf8"));
      return fileData;
    } else {
      throw new Error("No API and no local JSON available!");
    }
  }
}
 

async function convertCurrency(amountStr, from, to) {
  const data = await loadRates();
  const rates = data.rates;
 
  if (!rates[from] || !rates[from][to])
    throw new Error("Currency pair not supported");
 
  const amount = new Decimal(amountStr);
  const converted = amount.mul(new Decimal(rates[from][to]));
 
  const decimals = Math.log10(data.minorUnits[to]);
  const factor = new Decimal(data.minorUnits[to]);
  const display = converted.mul(factor).floor().div(factor);
 
  console.log(`${amountStr} ${from} = ${converted.toFixed(9)} ${to} (Exact)`);
  console.log(`${amountStr} ${from} = ${display.toFixed(decimals)} ${to} (Display)`);
 
  return converted;
}
 

async function toMinorUnit(amountStr, currency) {
  const data = await loadRates();
  const minorUnits = data.minorUnits;
 
  if (!minorUnits[currency])
    throw new Error("Currency not supported for minor units");
 
  const amount = new Decimal(amountStr);
  return amount.mul(minorUnits[currency]).floor();
}
 

async function convertViaMinorUnits(amountStr, from, to) {
  const data = await loadRates();
  const rates = data.rates;
  const minorUnits = data.minorUnits;
 
  if (!rates[from] || !rates[from][to])
    throw new Error("Currency pair not supported");
  if (!minorUnits[from] || !minorUnits[to])
    throw new Error("Minor units not defined");
 
  const amount = new Decimal(amountStr);
  const amountMinorFrom = amount.mul(minorUnits[from]);
  const adjustedRate = new Decimal(rates[from][to])
    .mul(minorUnits[to])
    .div(minorUnits[from]);
  const amountMinorTo = amountMinorFrom.mul(adjustedRate);
  const convertedAmount = amountMinorTo.div(minorUnits[to]);
 
  console.log(`${amountStr} ${from} = ${convertedAmount.toFixed(9)} ${to} (Exact via minor units)`);
 
  const decimals = Math.log10(minorUnits[to]);
  const factor = new Decimal(minorUnits[to]);
  const display = convertedAmount.mul(factor).floor().div(factor);
 
  console.log(`${amountStr} ${from} = ${display.toFixed(decimals)} ${to} (Display via minor units)`);
 
  return convertedAmount;
}
 
async function convertCrypto(amountStr, fromCrypto, toCurrency) {
  const res = await fetch(CRYPTO_API);
  if (!res.ok) throw new Error("Failed to fetch crypto rates");
  const data = await res.json();
 
  const cryptoRates = {};
  for (let id in cryptoMapping) {
    const sym = cryptoMapping[id];
    if (data[id] && data[id].usd) {
      cryptoRates[sym] = data[id].usd;
    }
  }
 
  if (!cryptoRates[fromCrypto])
    throw new Error(`Unsupported crypto: ${fromCrypto}`);
 
  const amount = new Decimal(amountStr);
  const usdValue = amount.mul(cryptoRates[fromCrypto]);
 
  if (toCurrency === "USD") {
    console.log(`${amountStr} ${fromCrypto} = ${usdValue.toFixed(9)} USD`);
    return usdValue;
  }
 
  const ratesData = await loadRates();
  const rates = ratesData.rates;
 
  if (!rates["USD"] || !rates["USD"][toCurrency])
    throw new Error(`Conversion from USD to ${toCurrency} not supported`);
 
  const finalValue = usdValue.mul(rates["USD"][toCurrency]);
  console.log(`${amountStr} ${fromCrypto} = ${finalValue.toFixed(9)} ${toCurrency}`);
  return finalValue;
}
 
export {
  convertCurrency,
  toMinorUnit,
  convertViaMinorUnits,
  convertCrypto,
};
