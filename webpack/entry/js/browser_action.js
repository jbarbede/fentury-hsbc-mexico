import Popup from './popup';
import Extension from './extension';
import DuplicatedOrdersDetector from './detector';

$(function() {

    const extension = new Extension();
    extension.checkSellerCentral().then(() => {
        const detector = new DuplicatedOrdersDetector(extension.getDb());
        Popup.initDetector(detector);
        Popup.goToSignedInPage();
    }).fail(() => {
        Popup.goToSignInPage();
    }).always(() => Popup.hideLoading());

});