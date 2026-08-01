export default class MyActivityParser {
    constructor() {
    }

    parseFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.readAsText(file);
            reader.onload = (e) => {
                const htmlString = e.target.result;

                // Parse the uploaded HTML
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlString, "text/html");
                let entries = doc.querySelectorAll('.outer-cell .mdl-grid');

                let transactions = []
                let unmatchedBodies = [];
                entries.forEach((entry) => {
                    let type = entry.getElementsByClassName('header-cell').textContent
                    let contentBody = entry.querySelector('.content-cell.mdl-typography--body-1').innerHTML
                    let contentCaption = entry.querySelector('.content-cell.mdl-typography--caption').innerHTML
                    let parsedContentBody = this.parseContentBody(contentBody);
                    let parsedContentCaption = this.parseContentCaption(contentCaption);
                    if (parsedContentBody.isMatched) {
                        transactions.push({
                            type: parsedContentBody.type,
                            amount: parsedContentBody.amount,
                            beneficiary: parsedContentBody.beneficiary,
                            account: parsedContentBody.account,
                            date: parsedContentBody.datetime,
                            status: parsedContentCaption.status
                        })
                    } else {
                        unmatchedBodies.push(contentBody)
                    }
                })
                let fileMetrics = {
                    total: entries.length,
                    matched: transactions.length,
                    unmatched: unmatchedBodies.length
                }
                let transactionMetrics = {
                    firstDate: null,
                    lastDate: null
                }
                if (transactions.length) {
                    transactionMetrics.firstDate = transactions[transactions.length - 1]?.date
                    transactionMetrics.lastDate = transactions[0]?.date
                }

                resolve({
                    fileMetrics,
                    transactions,
                    transactionMetrics
                })
            };
        })
    }

    parseContentBody(htmlString) {
        let parts = htmlString.split('<br>')
        let summary = null;
        let datetime = null;
        let amount = null;
        let beneficiary = null;
        let account = null;
        let type = null;
        let isMatched = false;

        summary = parts[0]
        if (parts.length > 1) {
            datetime = this.formatDatetime(parts[1])
        }
        if (summary) {
            const summaryPatterns = {
                'paid': /^Paid\s+(.+?)\s+to\s+(.+?)\s+using\s+Bank\s+Account\s+(.+)$/i,
                'paid_2': /^Paid\s+(.+?)\s+using\s+Bank\s+Account\s+(.+)$/i,
                'paid_3': /^Paid\s+(.+?)\s+to\s+(.+?)$/i,
                'sent': /^Sent\s+(.+?)\s+using\s+Bank\s+Account\s+(.+)$/i,
                'sent_2': /^Sent\s+(.+?)$/i,
                'received': /^Received\s+(.+?)$/i
            }
            const summaryKeyToTypeMapping = {
                'paid': 'Paid',
                'paid_2': 'Paid',
                'paid_3': 'Paid',
                'sent': 'Sent',
                'sent_2': 'Sent',
                'received': 'Received'
            }

            for (const [key, pattern] of Object.entries(summaryPatterns)) {
                const match = summary.match(pattern);
                if (match) {
                    type = summaryKeyToTypeMapping[key];
                    if (key === 'paid') {
                        amount = match[1];
                        beneficiary = match[2];
                        account = match[3];
                    } else if (key === 'sent') {
                        amount = match[1];
                        account = match[2];
                    } else if (key === 'received' || key === 'sent_2') {
                        amount = match[1]
                    } else if (key === 'paid_2') {
                        amount = match[1];
                        account = match[2];
                    } else if (key === 'paid_3') {
                        amount = match[1];
                        beneficiary = match[2];
                    }
                    isMatched = true;
                    break;
                }
            }
        }
        if (amount) {
            amount = amount.replace(/[^0-9.]/g, "")
        }
        return {
            type,
            amount,
            beneficiary,
            account,
            datetime,
            isMatched
        }
    }

    parseContentCaption(htmlString) {
        let parts = htmlString.split('<br>');
        let status = null;
        if (parts.length == 6) {
            status = typeof parts[4] === 'string' ? parts[4].trim() : null;
        }
        return {
            status
        }
    }

    formatDatetime(value) {
        // TODO: need to use standard library for date parsing
        const normalized = this.normalizeTimezone(value.replace(/,/g, ""));
        try {
            return new Date(normalized).toISOString();
        } catch (error) {
            return normalized;
        }
    }

    normalizeTimezone(dateStr) {
        const tzMap = {
            // Asia
            IST: "+05:30",   // India Standard Time
            JST: "+09:00",   // Japan Standard Time
            CST: "+08:00",   // China Standard Time
            KST: "+09:00",   // Korea Standard Time

            // Europe
            GMT: "+00:00",   // Greenwich Mean Time
            BST: "+01:00",   // British Summer Time
            CET: "+01:00",   // Central European Time
            CEST: "+02:00",  // Central European Summer Time
            EET: "+02:00",   // Eastern European Time
            EEST: "+03:00",  // Eastern European Summer Time

            // North America
            EST: "-05:00",   // Eastern Standard Time
            EDT: "-04:00",   // Eastern Daylight Time
            CST_US: "-06:00",// Central Standard Time (US)
            CDT: "-05:00",   // Central Daylight Time
            MST: "-07:00",   // Mountain Standard Time
            MDT: "-06:00",   // Mountain Daylight Time
            PST: "-08:00",   // Pacific Standard Time
            PDT: "-07:00",   // Pacific Daylight Time

            // Other
            UTC: "+00:00",   // Coordinated Universal Time
        };

        for (const [abbr, offset] of Object.entries(tzMap)) {
            if (dateStr.includes(abbr)) {
                return dateStr.replace(abbr, offset);
            }
        }
        return dateStr; // unchanged if no match
    }
}