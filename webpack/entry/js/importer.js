import * as md5 from 'md5';

import Extension from './extension';
import TransactionsPuller from './puller';

const TRANSACTION_URL = 'https://www.fentury.com/frontend/transactions?';

export default class TransactionsImporter {

    constructor() {
        this.init();
    }

    init() {
        this.transactions = [];
        this.totalTransactions = 0;
        this.processedTransactions = 0;
        this.skippedTransactions = 0;
        this.duplicatedTransactions = [];
        this.pendingTransactions = [];
        this.queries = [];
        this.stop = false;
    }

    getTransactions(params) {
        console.log(params);
        return TransactionsPuller.query(params);
    }

    process(params) {
        const that = this;
        //Load orders previously stored for the ASIN and pull recent orders.
        return this.getTransactions(params).then((response) => {
            chrome.tabs.query(
                { currentWindow: true, title: "*Fentury*" },
                function (tabArray) {
                    console.log('Fentury tab', tabArray);
                    chrome.tabs.executeScript(tabArray[0].id, {
                        code: 'document.getElementsByTagName("META")[5].getAttribute("content")'
                    }, function (results) {
                        const CSRFToken = results[0];
                        console.log('Fentury token', CSRFToken);
                        for (let i = 0; i < response.txnSumm.length; i++) {
                            that.processTransaction(response.txnSumm[i], CSRFToken);
                        }
                    });
                }
            )
        });
    }

    reset() {
        this.init();

        return $.Deferred().resolve().promise();
    }

    stopProcess() {
        //Set the stop flag.
        this.stop = true;

        //Stop any AJAX query still running.
        for (let i = 0; i < this.queries.length; i++) {
            this.queries[i].abort();
        }

        return $.Deferred().resolve().promise();
    }

    processTransaction(transaction, CSRFToken) {
        const that = this;
        const payee = md5(JSON.stringify(transaction));
        fetch("https://www.fentury.com/frontend/reports/payee_overview?dates_filter=false&account_ids=89796-89760&gender=all&payee_names%5B%5D=" + payee, {
            "credentials": "include",
            "headers": {
                "accept": "application/json, text/javascript, */*; q=0.01",
                "accept-language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7,es-419;q=0.6,es;q=0.5,gl;q=0.4,it;q=0.3,pt;q=0.2",
                "if-none-match": "W/\"400abf2cac512e69a318b4f67da208e9\"",
                "x-csrf-token": "uWtkY+gY5VXza2XtsxscO6gwIJcr+OBJSW/s4Aih/3t5zNPhyIguveT/Tzr3/QHAMFMvTgq6rcMgYFY+TbQkrQ==",
                "x-requested-with": "XMLHttpRequest",
                "x-utc-offset": "-5"
            },
            "referrer": "https://www.fentury.com/frontend/reports/payee_overview?payee=" + payee,
            "referrerPolicy": "same-origin",
            "body": null,
            "method": "GET",
            "mode": "cors"
        }).then(function (payeeOverview) {
            console.log('Processing transaction', transaction, payee);
            if (payeeOverview.status === 200) {
                payeeOverview.json().then(function (json) {
                    console.log('Payee exists?', json.data);
                    if (json.data.length === 0) {
                        if (transaction.txnTypeCde === 'D') {
                            that.insertTransaction(transaction, payee, CSRFToken);

                            console.log('Expense transaction added', transaction, payee);
                        } else {
                            that.insertTransaction(transaction, payee, CSRFToken);

                            console.log('Income transaction added', transaction, payee);
                        }
                    } else {
                        console.log('Transaction already added', transaction, payee);
                    }
                });

            } else {
                console.log('Wrong status when getting payee details', payeeOverview.status);
            }
        }, function (payeeOverview) {
            console.log(payeeOverview);
        });
    }

    insertTransaction(transaction, payee, CSRFToken) {
        const payload = {
            "transaction": {
                "made_on": transaction.txnDate,
                "account_id": 89760, // HSBC México Premier Debit
                "currency_id": 97, //MXN
                "category_id": 2009749, //Miscellaneous
                "tags": [],
                "status": "posted",
                "amount": transaction.txnAmt.amt,
                "payee_name": payee,
                "description": transaction.txnDetail[0]
            }
        };

        fetch("https://www.fentury.com/frontend/transactions?", {
            "credentials": "include",
            "headers": {
                "accept": "application/json, text/javascript, *\/*; q=0.01",
                "accept-language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7,es-419;q=0.6,es;q=0.5,gl;q=0.4,it;q=0.3,pt;q=0.2",
                "content-type": "application/json",
                "x-csrf-token": CSRFToken,
                "x-requested-with": "XMLHttpRequest",
                "x-utc-offset": "-5"
            },
            "referrer": "https://www.fentury.com/frontend/transactions",
            "referrerPolicy": "same-origin",
            "body": JSON.stringify(payload),
            "method": "POST",
            "mode": "cors"
        });
    }
}