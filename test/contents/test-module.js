let listener;
let count = 0;

export function setListenerForTestModule(rootElement) {
    listener = rootElement;
    listener.addEventListener('content-loaded', callMe);
}

export function callMe() {
    count++;
    listener.removeEventListener('content-loaded', callMe);
}

export function getCount() {
    return count;
}
