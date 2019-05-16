import TransactionsPuller from "./puller";

const DASHBOARD_URL = 'https://www.services.online-banking.hsbc.com.mx/gpib/group/gpib/cmn/layouts/default.html?uid=dashboard';

export default class Extension {

    constructor() { }

    static checkHSBCMexico() {
        let deferred = $.Deferred();

        $.ajax({ url: DASHBOARD_URL, method: 'get' }).then((response) => {
            if (response.includes('tempForm')) {
                deferred.reject();
            } else {
                Extension.getAccounts().then(function (accountsResponse) {
                    accountsResponse.json().then(function (data) {
                        console.log('HSBC accounts', data);
                        deferred.resolve(data);
                    });
                }).fail(function (accountsResponse) {
                    deferred.reject(accountsResponse);
                });
            }
        }).fail((response) => {
            deferred.reject(response);
        });

        return deferred.promise();
    }

    static getAccounts() {
        let deferred = $.Deferred();

        chrome.cookies.get({ url: 'https://www.services.online-banking.hsbc.com.mx', name: 'SYNC_TOKEN' }, function (cookie) {
            fetch("https://www.services.online-banking.hsbc.com.mx/gpib/channel/proxy/accountDataSvc/rtrvAcctSumm", {
                "credentials": "include",
                "headers": {
                    "accept": "*/*",
                    "accept-language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7,es-419;q=0.6,es;q=0.5,gl;q=0.4,it;q=0.3,pt;q=0.2",
                    "content-type": "application/json",
                    "x-hdr-synchronizer-token": cookie.value
                },
                "referrer": "https://www.services.online-banking.hsbc.com.mx/gpib/group/gpib/cmn/layouts/default.html?uid=dashboard",
                "referrerPolicy": "no-referrer-when-downgrade",
                "body": "{\"accountSummaryFilter\":{\"txnTypCdes\":[],\"entityCdes\":[{\"ctryCde\":\"MX\",\"grpMmbr\":\"HBMX\"}]},\"extensions\":[{\"name\":\"cust_Seg\",\"value\":\"V\"}]}",
                "method": "POST",
                "mode": "cors"
            }).then(function (response) {
                deferred.resolve(response);
            }, function (response) {
                deferred.reject(response);
            });
        });

        return deferred.promise();
    }
}