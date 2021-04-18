import hati from '../../src/hati.js';

describe('hati unhappy path', () => {
    let root;

    beforeEach(() => {
        root = document.createElement('div');
    });

    it('should load content into an specified element by its id using the data-target-id property of an <a> element', () => new Promise(resolve => {
        root.innerHTML = `
            <a href="/base/test/happy-path/test1.html" data-target-id="content">Test 1</a>
            <div id="content"><div>
        `;
    }));
});
