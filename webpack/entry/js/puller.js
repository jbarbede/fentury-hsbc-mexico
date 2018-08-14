const ORDERS_URL = 'https://sellercentral.amazon.com/orders-api/search?limit=###LIMIT###&offset=###OFFSET###&date-range=###START###-###END###&fulfillmentType=fba&orderStatus=all';

export default class OrderPuller {

    static query(startDate, endDate, limit = 10, offset = 0, asin = null) {
        let url = ORDERS_URL
            .replace('###START###', startDate)
            .replace('###END###', endDate)
            .replace('###LIMIT###', limit)
            .replace('###OFFSET###', offset);
        if (asin) {
            url += '&q=' + asin + '&qt=asin';
        }
        console.log('Orders URL: ' + url);

        return $.ajax({ url: url, method: 'get' });
    }

}