export default {
    log: (...args) => console.log(...args),

    /*eslint-disable no-alert, lines-around-comment*/
    shamefullyShowError: (message) => {
        console.log('Error', message);
        alert(`Error: ${message}`);
    }
    /*eslint-enable no-alert, lines-around-comment*/
};
