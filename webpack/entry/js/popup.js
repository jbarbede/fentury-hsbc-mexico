import * as momentjs from "moment";

export default class Popup {

    static initDetector(accounts, importer) {
        Popup.prepareHTML(accounts);
        $('body').on('submit', 'form', function (event) {
            event.preventDefault();
            $(this).slideUp(() => {
                $('#results-container').fadeIn(() => {
                    const params = $(this).serializeArray();
                    importer.process(Popup.objectifyForm(params)).then(() => Popup.finishHtml(importer));
                });
            });
        }).on('click', '#btn-reset', function () {
            importer.reset().then(() => Popup.resetHtml());
        }).on('click', '#btn-stop', function () {
            importer.stopProcess().then(() => Popup.finishHtml(importer));
        });
    }

    static prepareHTML(accounts) {
        const $html = $('body');
        const $select = $html.find('select[name=accountIndex]');
        for (let i = 0; i < accounts.countriesAccountList[0].acctLiteWrapper.length; i++) {
            const account = accounts.countriesAccountList[0].acctLiteWrapper[i];
            $select.append('<option value="' + account.acctIndex + '">' + account.prodTypeDesc + '</option>');
        }
        this.getFenturyUserData().then((user) => {
            const $select = $html.find('select[name=fenturyAccount]');
            for (let i = 0; i < user.accounts.length; i++) {
                const account = user.accounts[i];
                $select.append('<option value="' + account.id + '">' + account.name + '</option>');
            }
        });
        const $startDate = $html.find('input[name=startDate]');
        $startDate.val(localStorage.getItem('_last_end_date') || momentjs().subtract(1, 'day').format('YYYY-MM-DD'));
        const $endDate = $html.find('input[name=endDate]');
        $endDate.val(momentjs().format('YYYY-MM-DD'));
    }

    static goToSignInPage() {
        $('#sign-in').addClass('d-flex');
    }

    static goToSignedInPage() {
        $('#signed-in').fadeIn();
    }

    static hideLoading() {
        $('#loading').hide();
    }

    static resetHtml() {
        const $html = $('body');
        $html.find('input[name=asin]').val('');
        $html.find('form').slideDown(() => {
            $html.find('#processed-orders').empty();
            $html.find('#promotion-orders').html('0');
            $html.find('#skipped-orders').html('0');
            $html.find('#duplicated-orders').html('0');
            $html.find('#buttons').html('<button id="btn-stop" type="button" class="btn btn-danger btn-lg btn-block">Stop</button>');
        });
    }

    static finishHtml(detector) {
        const $html = $("#results");
        $html.find('#processed-orders').html('<h3 class="text-success"><i class="fa fa-check"></i> Import completed</h3>');
        $html.find('#buttons').html('<button id="btn-reset" type="button" class="btn btn-primary btn-lg btn-block">New Import</button>');
    }

    static objectifyForm(formArray) {
        let returnArray = {};
        for (var i = 0; i < formArray.length; i++) {
            returnArray[formArray[i]['name']] = formArray[i]['value'];
        }

        return returnArray;
    }

    static getFenturyUserData() {
        const code = 'JSON.stringify(window.localStorage.getItem("user"))';

        let deferred = $.Deferred();
        chrome.tabs.query(
            { currentWindow: true, title: "*Fentury*" },
            function (tabArray) {
                console.log('Fentury tab', tabArray);
                chrome.tabs.executeScript(tabArray[0].id, {
                    code: code
                }, function (results) {
                    const user = JSON.parse(results);
                    deferred.resolve(JSON.parse(user));
                })
            }
        );

        return deferred.promise();
    }
}