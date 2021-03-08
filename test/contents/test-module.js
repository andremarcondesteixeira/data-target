let listener;

export function callMe() {
    console.log('callMe function from test-module.js was called');
    listener.removeEventListener('content-loaded', callMe);
}

export function setListenerForTestModule(rootElement) {
    listener = rootElement;
    listener.addEventListener('content-loaded', callMe);
}

console.log('test-module.js imported');
