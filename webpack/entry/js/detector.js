import OrderPuller from './puller';

const ORDER_URL = 'https://sellercentral.amazon.com/hz/orders/details?_encoding=UTF8&orderId=';

export default class DuplicatedOrdersDetector {

    constructor() {
        this.init();
    }

    setAsin(asin) {
        this.asin = asin;
    }

    init() {
        this.asin = null;
        this.startDate = new Date().valueOf();
        this.endDate = new Date().valueOf();
        this.totalOrders = 0;
        this.processedOrders = 0;
        this.skippedOrders = 0;
        this.pulledOrders = [];
        this.duplicatedOrders = [];
        this.promotionOrders = [];
        this.pendingOrders = [];
        this.checkAccess();
    }

    checkAccess() {
        OrderPuller.query(this.startDate, this.endDate, 1, 0).then(() => {
            $('#signed-in').fadeIn();
        }).fail(() => {
            $('#sign-in').addClass('d-flex');
        }).always(() => $('#loading').remove());
    }

    initHtml() {
        const $html = $('body');
        $html.find('input[name=asin]').val('');
        $html.find('form').slideDown(() => {
            $html.find('.progress-bar').addClass('progress-bar-animated').css('width', 0);
            $html.find('#results h1').html('');
            $html.find('#duplicated-orders').html('0');
            $html.find('#buttons').html('<button id="btn-stop" type="button" class="btn btn-danger btn-lg btn-block">Stop</button>');
        });
    }

    processOrderItem(orderId, $html, $item) {
        const $asin = $item.find('#myo-order-details-product-asin');
        if ($asin.length === 0) {
            //console.warn('Order ' + orderId + '  - no ASIN within that table row.');
            return false;
        }

        const asin = $asin.text().replace(/(\r\n|\n|\r)/gm, '').trim().replace(/ +(?= )/g, '');
        if (asin !== this.asin) {
            console.log('Order ' + orderId + ' - row for ASIN ' + asin + ' skipped: this is a different product.');
            return false;
        }

        //Does the ASIN have a promotion total?
        const $promotion = $item.find('#myo-order-details-item-promotion-total');
        if ($promotion.length === 0) {
            console.log('Order ' + orderId + ' - row for ASIN ' + asin + ' skipped: no promotion');
            return false;
        }

        const $shipping = $item.find('#myo-order-details-item-shipping-total');
        const promotion = parseFloat($promotion.text().replace('-', '').replace(',', '').replace('$', ''));
        const shipping = parseFloat($shipping.text().replace('-', '').replace(',', '').replace('$', ''));
        if (promotion === shipping) {
            console.log('Order ' + orderId + ' - row for ASIN ' + asin + ' skipped: free shipping');
            return false;
        }

        const $address = $html.find('#myo-order-details-buyer-address');
        let address = '';
        if ($address.length > 0) {
            address = $address.text().replace(/(\r\n|\n|\r)/gm, '').trim().replace(/ +(?= )/g, '').toLowerCase();
            console.log('Order ' + orderId + ': ' + address);
        } else {
            console.warn('Order ' + orderId + ': no address');
        }

        const $buyerName = $html.find('#contact_buyer_link');
        let buyerName = '';
        if ($buyerName.length > 0) {
            buyerName = $buyerName.text().replace(/(\r\n|\n|\r)/gm, '').trim().replace(/ +(?= )/g, '').toLowerCase();
            console.log('Buyer name for order ' + orderId + ': ' + buyerName);
        } else {
            console.warn('Order ' + orderId + ': no buyer name (probably a gift)');
        }

        //Add order to orders list.
        this.promotionOrders.push({
            orderId: orderId,
            address: address,
            buyerName: buyerName
        });
        $("#promotion-orders").html(this.promotionOrders.length);

        return true;
    }

    processOrder(html) {
        //Strip images, let's avoid loading them.
        const $html = $(html.replace(/<img[^>]*>/g, ''));
        const $orderId = $html.find('#myo-set-merchant-order-id-displayText');
        if ($orderId.length > 0) {
            const orderId = $orderId.text();
            let processed = false;
            $.each($html.find('#myo-order-items tr'), (i, item) => {
                if (this.processOrderItem(orderId, $html, $(item))) {
                    processed = true;
                }
            });
            if (!processed) {
                this.skippedOrders++;
                $("#skipped-orders").html(this.skippedOrders);
            }
        } else {
            console.log('Order skipped: this is not a common order');
            this.skippedOrders++;
            $("#skipped-orders").html(this.skippedOrders);
        }
    }

    processOrders(orders) {
        let queries = [];
        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            if (order.amazonOrderId.charAt(0) !== 'S') {
                if (order.orderFulfillmentStatus === 'Pending' && this.pendingOrders.indexOf(order.amazonOrderId) === -1) {
                    this.pendingOrders.push(order.amazonOrderId);
                    chrome.notifications.create({
                        type: 'basic',
                        title: 'New order ' + order.amazonOrderId,
                        iconUrl: 'icons/48.png',
                        message: 'A new order ' + order.amazonOrderId + ' has been created by a buyer',
                        requireInteraction: true
                    });
                } else if (order.orderFulfillmentStatus !== 'Pending' && this.pendingOrders.indexOf(order.amazonOrderId) !== -1) {
                    if (order.orderFulfillmentStatus === 'PaymentComplete') {
                        this.pendingOrders.splice(this.pendingOrders.indexOf(order.amazonOrderId), 1);
                    }

                    chrome.notifications.create({
                        type: 'basic',
                        title: 'New status for order ' + order.amazonOrderId,
                        iconUrl: 'icons/48.png',
                        message: 'The status for the order ' + order.amazonOrderId + ' has been changed to ' + order.orderFulfillmentStatus + '.',
                        requireInteraction: true
                    });
                }
                const q = $.ajax({ url: ORDER_URL + order.amazonOrderId, method: 'get' })
                    .fail((error) => console.error(error));
                queries.push(q);
            } else {
                console.warn('Order skipped: ' + order.amazonOrderId);
                this.skippedOrders++;
                $("#skipped-orders").html(this.skippedOrders);
            }
        }

        return $.when(...queries).done(() => {
            $.each(queries, (i, query) => {
                this.processOrder(query.responseText);
            });
        });
    }

    processNewOrders(limit = 25, offset = 0) {
        console.log("Retrieving data for " + limit + " orders starting from " + offset + "...");

        const $html = $("#results");

        return OrderPuller.query(this.startDate, this.endDate, limit, offset, this.asin)
            .then((response) => {
                this.totalOrders = response.total;
                $html.find('h1').html(this.processedOrders + ' / ' + this.totalOrders);
                console.log("We pulled " + response.orders.length + " orders.");
                if (response.orders.length > 0) {
                    return this.processOrders(response.orders);
                }

                return $.Deferred().promise();
            })
            .then(() => {
                this.processedOrders += limit;
                const percent = ((this.processedOrders / this.totalOrders) * 100).toFixed(2) + '%';
                $html.find('.progress-bar').css('width', percent);
                if (this.processedOrders < this.totalOrders) {
                    $html.find('h1').html(this.processedOrders + ' / ' + this.totalOrders);
                    this.processNewOrders(limit, this.processedOrders);
                } else {
                    $html.find('h1').html(this.totalOrders + ' / ' + this.totalOrders);
                    this.detectDuplicates();
                    this.finish();
                }
            });
    }

    detectDuplicates() {
        for (let i = 0; i < this.promotionOrders.length; i++) {
            const order = this.promotionOrders[i];
            for (let j = 0; j < this.promotionOrders.length; j++) {
                const another_order = this.promotionOrders[j];
                if (order.orderId !== another_order.orderId && order.address === another_order.address) {
                    this.duplicatedOrders.push([order, another_order]);
                    $("#duplicated-orders").html(this.duplicatedOrders.length);
                }
            }
        }
    }

    getAsinData() {
        let date = new Date();
        let data = window.localStorage.getItem(this.asin);
        if (data) {
            data = JSON.parse(data);
            this.endDate = date.valueOf();
            date.setDate(date.getDate() - 3);
            this.startDate = date.valueOf();
            //this.startDate = data.startDate;
            this.pendingOrders = data.pendingOrders;
            this.promotionOrders = data.promotionOrders;
        } else {
            this.endDate = date.valueOf();
            date.setMonth(date.getMonth() - 1);
            this.startDate = date.valueOf();
            this.pendingOrders = [];
            this.promotionOrders = [];
        }
    }

    setAsinData() {
        window.localStorage.setItem(this.asin, JSON.stringify({
            startDate: this.endDate,
            pendingOrders: this.pendingOrders,
            promotionOrders: this.promotionOrders
        }))
    }

    process() {
        //Load orders previously stored.
        this.getAsinData();

        //Process new orders.
        this.processNewOrders();
    }

    signIn() {
        this.stopProcess();
        $('#signed-in').fadeOut('fast', () => {
            $('#sign-in').addClass('d-flex');
        });
    }

    finish() {
        this.setAsinData();
        const $html = $("#results");
        $html.find('.progress-bar').removeClass('progress-bar-animated');
        $html.find('#buttons').html('<div class="row">' +
            '<div class="col-6">' +
            this.generateDownloadButton() +
            '</div>' +
            '<div class="col-6">' +
            '<button id="btn-reset" type="button" class="btn btn-secondary btn-lg btn-block">New Match</button>' +
            '</div>' +
            '</div>');
    }

    generateDownloadButton() {
        const now = new Date().toUTCString().replace(',', '').replace(/[:\s+]/g, '-').toLowerCase();
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Order ID,Buyer Name,Address\n";
        this.duplicatedOrders.forEach((data) => {
            csvContent += data[0].orderId + "," + data[0].buyerName + "," + data[0].address + "\n";
        });
        const encodedUri = encodeURI(csvContent);

        return '<a id="download" href="' + encodedUri + '" class="btn btn-danger btn-lg btn-block" ' +
            'download="email-matching-' + now + '.csv" target="_blank">Download</a>';
    }

    reset() {
        this.init();
        this.initHtml();
    }

    stopProcess() {
        this.finish();
    }
}