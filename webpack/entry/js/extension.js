const DASHBOARD_URL = 'https://www.services.online-banking.hsbc.com.mx/gpib/group/gpib/cmn/layouts/default.html?uid=dashboard';

export default class Extension {

    constructor() { }

    checkHSBCMexico() {
        let deferred = $.Deferred();

        $.ajax({ url: DASHBOARD_URL, method: 'get' }).then((response) => {
            if (response.includes('tempForm')) {
                deferred.reject();
            } else {
                deferred.resolve();
            }
        }).fail((response) => {
            deferred.reject();
        });

        return deferred.promise();
    }
}