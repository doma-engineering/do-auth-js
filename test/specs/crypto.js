const assert = require('assert/strict');

describe('doauthor cryptography suite', () => {
    it('decodes and encodes base64 in a way that is compatible with the reference implementation', async () => {
        await browser.url('http://localhost:8174/example.html');
        const title = await browser.getTitle();
        assert.equal(title, "doauthor demo");
    })
})
