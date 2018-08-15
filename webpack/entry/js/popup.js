export default class Popup {

    static initDetector(detector) {
        $('body').on('submit', 'form', function (event) {
            event.preventDefault();
            const value = $(this).find('input[name=asin]').val();
            $(this).slideUp(() => {
                detector.setAsin(value);
                detector.process().then(() => Popup.finishHtml(detector));
            });
        }).on('click', '#btn-reset', function() {
            detector.reset().then(() => Popup.resetHtml());
        }).on('click', '#btn-stop', function() {
            detector.stopProcess().then(() => Popup.finishHtml(detector));
        });
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
                Popup.generateDownloadButton(detector) +
            '</div>' +
            '<div class="col-6">' +
                '<button id="btn-reset" type="button" class="btn btn-secondary btn-lg btn-block">New Detection</button>' +
            '</div>' +
        '</div>');
    }

    static generateDownloadButton(detector) {
        const now = new Date().toUTCString().replace(',', '').replace(/[:\s+]/g, '-').toLowerCase();
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Order ID,Buyer Name,Address\n";
        detector.getDuplicatedOrders().forEach((data) => {
            csvContent += data[0].orderId + "," + data[0].buyerName + "," + data[0].address + "\n";
        });
        const encodedUri = encodeURI(csvContent);

        return '<a id="download" href="' + encodedUri + '" class="btn btn-danger btn-lg btn-block" ' +
            'download="email-matching-' + now + '.csv" target="_blank">Download</a>';
    }
}