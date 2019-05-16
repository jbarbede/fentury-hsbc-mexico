<!doctype html>
<html>

    <head>

        <link href="https://fonts.googleapis.com/css?family=Rubik" rel="stylesheet">

        <script type="text/javascript" src="assets/browser_action.js"></script>

    </head>

    <body>

        <div class="container-fluid">

            <div id="loading">

                <div  class="d-flex align-items-center justify-content-center flex-column h-100">

                    <i class="fa fa-spin fa-spinner fa-7x mb-3"></i>

                    Checking access to your HSBC Mexico bank account...

                </div>

            </div>

            <div id="sign-in" class="align-items-center justify-content-center">

                <a href="https://www.security.online-banking.hsbc.com.mx/gsa/SECURITY_LOGON_PAGE/" class="btn btn-primary btn-lg" target="_blank">
                    Sign In HSBC Mexico
                </a>

            </div>

            <div id="signed-in">

                <div class="alert alert-info">
                    <i class="fa fa-info-circle"></i> Press the button below to start importing transactions from HSBC Mexico.
                    We will process transactions created during the last 30 days.
                </div>

                <form id="pull-transactions-form" method="post">

                    <div class="form-group">
                        <label for="hsbc-account">HSBC account</label>
                        <div class="form-controls">
                            <select name="accountIndex" id="hsbc-account" class="form-control"></select>
                        </div>
                    </div>

                    <div class="row">

                        <div class="col-6">
                            <div class="form-group">
                                <label for="start-date">From</label>
                                <div class="form-controls">
                                    <input type="date" name="startDate" id="start-date" class="form-control" value="2019-05-15">
                                </div>
                            </div>
                        </div>

                        <div class="col-6">
                            <div class="form-group">
                                <label for="end-date">To</label>
                                <div class="form-controls">
                                    <input type="date" name="endDate" id="end-date" class="form-control" value="2019-05-16">
                                </div>
                            </div>
                        </div>

                    </div>

                    <button type="submit" class="btn btn-primary btn-lg btn-block">
                        Pull transactions
                    </button>

                </form>

                <!--<div id="results" class="d-flex flex-column justify-content-between">

                    <div id="processed-orders" class="text-center py-4">

                        <h1><i class="fa fa-spin fa-spinner"></i></h1>

                        <div class="progress mt-3">
                            <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar"
                                 aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>

                    </div>

                    <div class="row py-4">

                        <div class="col-4">
                            <div class="callout callout-success">
                                <small class="text-muted">Orders With Promotion</small>
                                <br>
                                <strong id="promotion-orders" class="h4">0</strong>
                            </div>
                        </div>

                        <div class="col-4">
                            <div class="callout callout-success">
                                <small class="text-muted">Skipped Orders</small>
                                <br>
                                <strong id="skipped-orders" class="h4">0</strong>
                            </div>
                        </div>

                        <div class="col-4">
                            <div class="callout callout-success">
                                <small class="text-muted">Duplicated Orders</small>
                                <br>
                                <strong id="duplicated-orders" class="h4">0</strong>
                            </div>
                        </div>

                    </div>

                    <div id="buttons">

                        <button id="btn-stop" type="button" class="btn btn-danger btn-lg btn-block">Stop</button>

                    </div>

                </div>

            </div>-->

        </div>

    </body>

</html>