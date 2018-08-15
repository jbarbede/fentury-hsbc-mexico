const MERCHANT_URL = 'https://sellercentral.amazon.com/trim/component/merchant-marketplace-switcher';

export default class Extension {

    constructor() {
        this.db = null;
    }

    getDb() {
        return this.db;
    }

    checkSellerCentral() {
        let deferred = $.Deferred();

        $.ajax({ url: MERCHANT_URL, method: 'get' }).then((response) => {
            this.initDatabase(response);

            deferred.resolve();
        }).fail(() => {
            deferred.reject();
        });

        return deferred.promise();
    }

    initDatabase(response) {
        const $html = $('<div>' + response.replace(/<img[^>]*>/g, '') + '</div>');
        const merchant = Extension.cleanText($html.find('.sc-mkt-picker-switcher-txt').text())
            .toLowerCase().replace(' ', '');
        const marketplace = Extension.cleanText($html.find('#sc-mkt-picker-switcher-select option:selected').text())
            .toLowerCase().replace('www.amazon', '');
        this.db = new PouchDB(merchant + marketplace);
        console.log("Connection to the database " + merchant + marketplace + " is now established.");
    }

    static cleanText(text) {
        return text.replace(/(\r\n|\n|\r)/gm, '').trim().replace(/ +(?= )/g, '');
    }
}