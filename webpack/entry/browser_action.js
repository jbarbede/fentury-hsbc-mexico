//############################ JS ############################

// jQuery
require('jquery/dist/jquery.js');
// Popper.js
require('popper.js/dist/umd/popper.js');
// Bootstrap
require('bootstrap/dist/js/bootstrap.js');
// PouchDB
require('pouchdb/dist/pouchdb.js');
// Extension
require('./js/importer.js');
require('./js/hsbc-accounts-puller');
require('./js/hsbc-transactions-puller');
require('./js/popup.js');
require('./js/extension.js');
require('./js/browser_action.js');

//########################### CSS #############################

// Font Awesome
require('@fortawesome/fontawesome-free/scss/fontawesome.scss');
require('@fortawesome/fontawesome-free/scss/solid.scss');

// Extension
require('./scss/project.scss');
