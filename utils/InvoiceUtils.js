import { currencyData } from "../currency.js";

const units = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
];

const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

export const convertToWords = (num) => {
    if (num === 0) return 'Zero';

    if (num < 20) return units[num];

    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + convertToWords(num % 10) : '');

    if (num < 1000) return units[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' and ' + convertToWords(num % 100) : '');

    if (num < 1000000) return convertToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 !== 0 ? ' ' + convertToWords(num % 1000) : '');

    if (num < 1000000000) return convertToWords(Math.floor(num / 1000000)) + ' Million' + (num % 1000000 !== 0 ? ' ' + convertToWords(num % 1000000) : '');

    return convertToWords(Math.floor(num / 1000000000)) + ' Billion' + (num % 1000000000 !== 0 ? ' ' + convertToWords(num % 1000000000) : '');
}

export const totalInWords = (num, currency = 'INR') => {
    const validNum = parseFloat(num);
    if (isNaN(validNum)) {
        throw new Error("Invalid number input for totalInWords");
    }

    const [integerPart, decimalPart] = validNum.toFixed(2).split('.');
    const currencyInfo = currencyData[currency];

    if (!currencyInfo) {
        throw new Error(`Currency code ${currency} is not supported.`);
    }

    const mainCurrencyName = parseInt(integerPart) === 1 ? currencyInfo.name : currencyInfo.name_plural;
    const fractionalCurrencyName = parseInt(decimalPart) === 1 ? currencyInfo.name : currencyInfo.name_plural;

    let result = convertToWords(parseInt(integerPart)) + ` ${mainCurrencyName}`;

    if (parseInt(decimalPart) > 0) {
        result += ' and ' + convertToWords(parseInt(decimalPart)) + ` ${fractionalCurrencyName}`;
    }

    return result;
}
