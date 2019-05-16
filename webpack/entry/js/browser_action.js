import Popup from './popup';
import Extension from './extension';
import TransactionsImporter from './importer';

$(function() {

    Extension.checkHSBCMexico().then((accounts) => {
        const importer = new TransactionsImporter();
        Popup.initDetector(accounts, importer);
        Popup.goToSignedInPage();
    }).fail(() => {
        Popup.goToSignInPage();
    }).always(() => Popup.hideLoading());

});