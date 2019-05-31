const ACCOUNTS_URL = "https://www.services.online-banking.hsbc.com.mx/gpib/channel/proxy/accountDataSvc/rtrvAcctSumm";

export default class HSBCAccountsPuller {

    static loadAccounts(response) {
        let deferred = $.Deferred();

        response.json().then(function (accounts) {
            HSBCAccountsPuller.accounts = accounts;
            deferred.resolve(accounts);
        }, function () {
            deferred.reject(accounts);
        });

        return deferred.promise();
    }

    static getAccounts() {
        let deferred = $.Deferred();

        chrome.cookies.get({ url: 'https://www.services.online-banking.hsbc.com.mx', name: 'SYNC_TOKEN' }, function (cookie) {
            fetch(ACCOUNTS_URL, {
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
            }).then(function (accountsResponse) {
                deferred.resolve(accountsResponse);
            }, function (response) {
                deferred.reject(response);
            });
        });

        return deferred.promise();
    }

    get accounts() {
        return this.accounts;
    }

    set accounts(accounts) {
        this.accounts = accounts;
    }
}