import TransactionsImporter from "./importer";
import Extension from "./extension";

const SELLER_CENTRAL_URL = '://sellercentral.amazon.com';

chrome.alarms.create('orders', {
    periodInMinutes: 1.0
});

chrome.alarms.create('tab', {
    periodInMinutes: 60.0
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'orders') {
        const extension = new Extension();
        extension.checkHSBCMexico().then(() => {
            const importer = new TransactionsImporter();
            importer.processAll();
        }).fail(() => {
            console.log("The seller is not signed in Amazon Seller Central.");
        });
    } else if (alarm.name === 'tab') {
        chrome.tabs.query({
            url: '*' + SELLER_CENTRAL_URL + '/*'
        }, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.reload(tabs[0].id);
                console.log('Seller Central tab reloaded');
            } else {
                console.log("No Seller Central tab opened.");
            }
        });
    }
});