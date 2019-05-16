const TRANSACTIONS_URL = 'https://www.services.online-banking.hsbc.com.mx/gpib/channel/proxy/accountDataSvc/rtrvTxnSumm';

export default class TransactionsPuller {

    static getSessionStorage() {
        const code = 'JSON.stringify(window.sessionStorage)';

        let deferred = $.Deferred();
        chrome.tabs.query(
            { currentWindow: true, title: "*Banca por Internet | HSBC*" },
            function (tabArray) {
                console.log('HSBC tab', tabArray);
                chrome.tabs.executeScript(tabArray[0].id, {
                    code: code
                }, function (results) {
                    const vars = JSON.parse(results);
                    deferred.resolve(vars.accountIndex);
                })
            }
        );

        return deferred.promise();
    }

    static query(params) {
        let deferred = $.Deferred();

        this.getSessionStorage().then(function (accountIndex) {
            const payload = {
                "retreiveTxnSummaryFilter": {
                    "txnDatRnge": {
                        "fromDate": params.startDate,
                        "toDate": params.endDate
                    },
                    "numOfRec": -1,
                    "txnAmtRnge": null,
                    "txnHistType": null,
                    "fndTxnTyp": "",
                    "fndName": ""
                },
                "acctIdr": {
                    "acctIndex": params.accountIndex,
                    "entProdTypCde": "19",
                    "entProdCatCde": "DDA"
                },
                "pagingInfo": {
                    "startDetail": null,
                    "pagingDirectionCode": "D"
                },
                "extensions": [{ "name": "cust_Seg", "value": "V" }]
            };

            chrome.cookies.get({ url: 'https://www.services.online-banking.hsbc.com.mx', name: 'SYNC_TOKEN' }, function (cookie) {
                $.ajax({
                    url: TRANSACTIONS_URL,
                    type: "POST",
                    dataType: "json",
                    data: JSON.stringify(payload),
                    contentType: "application/json",
                    beforeSend: function (xhr) { xhr.setRequestHeader('X-HDR-Synchronizer-Token', cookie.value); }
                }).then(function (response) {
                    deferred.resolve(response);
                }).fail(function (response) {
                    deferred.reject();
                });
            });
        });

        return deferred.promise();
    }

}