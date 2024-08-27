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

export const totalInWords = (num) => {
    const [integerPart, decimalPart] = num.toFixed(2).split('.');
    let result = convertToWords(parseInt(integerPart)) + ' Rupees';
    if (parseInt(decimalPart) > 0) {
        result += ' and ' + convertToWords(parseInt(decimalPart)) + ' Paise';
    }
    return result;
}
