const assert = require('assert/strict');

describe('doauthor embedded test suite', () => {
    it('passes all the checks', async () => {
        await browser.url('http://localhost:8174/embedded_test_suite.html');
        await browser.pause(600); // Dirty hack to make sure that embedded test stuite is done
        // A better way to do it is to insert JS that will wait till tests are no longer pending
        const title = await browser.getTitle();
        assert.equal(title, "doauthor demo");
        const checks = await $$('.test');
        checks.reduce(async (_acc, x) => {
            const okMaybe = await x.getText();
            assert.equal(okMaybe, "ok");
        });
    });
    it('preserves data in localStorage', async () => {
        await browser.url('http://localhost:8174/embedded_test_suite.html');
        await browser.pause(600);
        const slip = await $('#slip').getText();
        const testId = await $('#test-id').getText();
        await browser.newWindow('http://localhost:8174/embedded_test_suite.html');
        await browser.pause(600);
        const testId1 = await $('#test-id').getText();
        const slip1 = await $('#slip').getText();
        assert.equal(slip, slip1);
        assert.notEqual(testId, testId1);
    });
})
