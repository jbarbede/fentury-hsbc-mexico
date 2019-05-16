import Popup from './popup';
import Extension from './extension';
import TransactionsImporter from './importer';

$(function() {

    const extension = new Extension();
    extension.checkHSBCMexico().then(() => {
        const importer = new TransactionsImporter();
        Popup.initDetector(importer);
        Popup.goToSignedInPage();
    }).fail(() => {
        Popup.goToSignInPage();
    }).always(() => Popup.hideLoading());

});