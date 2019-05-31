import HSBCAccountsPuller from "./hsbc-accounts-puller";

const DASHBOARD_URL = 'https://www.services.online-banking.hsbc.com.mx/gpib/group/gpib/cmn/layouts/default.html?uid=dashboard';

export default class Extension {

    static checkHSBCMexico() {
        let deferred = $.Deferred();

        $.ajax({ url: DASHBOARD_URL, method: 'get' }).then((response) => {
            if (response.includes('tempForm')) {
                deferred.reject();
            } else {
                HSBCAccountsPuller.getAccounts().then(function (accountsResponse) {
                    HSBCAccountsPuller.loadAccounts(accountsResponse).then(function (data) {
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
}