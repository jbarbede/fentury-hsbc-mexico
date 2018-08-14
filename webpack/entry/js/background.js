import DuplicatedOrdersDetector from "./detector";

chrome.alarms.create({
    periodInMinutes: 1.0
});

chrome.alarms.onAlarm.addListener(function() {
    const duplicatedOrdersDetector = new DuplicatedOrdersDetector();

    const keys = Object.keys(window.localStorage);

    for (let i = 0; i < keys.length; i++) {
        console.log('Checking new orders for ASIN ' + keys[i] + '...');
        duplicatedOrdersDetector.setAsin(keys[i]);
        duplicatedOrdersDetector.process();
    }
});