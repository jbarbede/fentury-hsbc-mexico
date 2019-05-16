export default class Popup {

    static initDetector(accounts, importer) {
        Popup.generateAccountsSelector(accounts);
        $('body').on('submit', 'form', function (event) {
            event.preventDefault();
            $(this).slideUp(() => {
                const params = $(this).serializeArray();
                importer.process(Popup.objectifyForm(params)).then(() => Popup.finishHtml(importer));
            });
        }).on('click', '#btn-reset', function () {
            importer.reset().then(() => Popup.resetHtml());
        }).on('click', '#btn-stop', function () {
            importer.stopProcess().then(() => Popup.finishHtml(importer));
        });
    }

    static generateAccountsSelector(accounts) {
        const $html = $('body');
        const $select = $html.find('select[name=accountIndex]');
        for (let i = 0; i < accounts.countriesAccountList[0].acctLiteWrapper.length; i++) {
            const account = accounts.countriesAccountList[0].acctLiteWrapper[i];
            $select.append('<option value="' + account.acctIndex + '">' + account.prodTypeDesc + '</option>');
        }
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
            $html.find('.progress-bar').addClass('progress-bar-animated').css('width', 0);
            $html.find('#results h1').html('<i class="fa fa-spin fa-spinner"></i>');
            $html.find('#promotion-orders').html('0');
            $html.find('#skipped-orders').html('0');
            $html.find('#duplicated-orders').html('0');
            $html.find('#buttons').html('<button id="btn-stop" type="button" class="btn btn-danger btn-lg btn-block">Stop</button>');
        });
    }

    static finishHtml(detector) {
        const $html = $("#results");
        $html.find('.progress-bar').removeClass('progress-bar-animated');
        $html.find('#buttons').html('<div class="row">' +
            '<div class="col-6">' +

            '</div>' +
            '<div class="col-6">' +
            '<button id="btn-reset" type="button" class="btn btn-secondary btn-lg btn-block">New Import</button>' +
            '</div>' +
            '</div>');
    }

    static objectifyForm(formArray) {
        let returnArray = {};
        for (var i = 0; i < formArray.length; i++) {
            returnArray[formArray[i]['name']] = formArray[i]['value'];
        }

        return returnArray;
    }
}