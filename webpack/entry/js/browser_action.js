import DuplicatedOrdersDetector from './detector';

$(function() {

    const duplicatedOrdersDetector = new DuplicatedOrdersDetector();

    $('body').on('submit', 'form', function (event) {
        event.preventDefault();
        const value = $(this).find('input[name=asin]').val();
        $(this).slideUp(() => {
            duplicatedOrdersDetector.setAsin(value);
            duplicatedOrdersDetector.process();
        });
    }).on('click', '#btn-reset', function() {
        duplicatedOrdersDetector.reset();
    }).on('click', '#btn-stop', function() {
        duplicatedOrdersDetector.stopProcess();
    });

});