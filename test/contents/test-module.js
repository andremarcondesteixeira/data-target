let listener;
let count = 0;

export function setListenerForTestModule(rootElement) {
    listener = rootElement;
    listener.addEventListener('content-loaded', callMe);
}

export function callMe() {
    count++;
    console.log('callMe function from test-module.js was called');
    listener.removeEventListener('content-loaded', callMe);
}

export function getCount() {
    return count;
}
