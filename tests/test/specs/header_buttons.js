var assert = require('assert');
var sleep = require('sleep');

describe('header buttons', function() {
    it('new', function () {
        browser.url('http://localhost:3000/editor');
        browser.click('#nav-header-new-btn');

        sleep.sleep(1);

        display = browser.getCssProperty('#modal-new', 'display');

        assert.equal(display.value, 'block');
    });
    it('save', function () {
        browser.url('http://localhost:3000/editor');
        browser.click('#nav-header-save');

        sleep.sleep(1);

        display = browser.getCssProperty('#modal-save', 'display');

        assert.equal(display.value, 'block');
    });
    it('load', function () {
        browser.url('http://localhost:3000/editor');
        browser.click('#nav-header-load-btn');

        sleep.sleep(1);

        display = browser.getCssProperty('#modal-load', 'display');

        assert.equal(display.value, 'block');
    });
    it('puzzles', function () {
        browser.url('http://localhost:3000/editor');
        browser.click('#nav-header-puzzles-btn');

        sleep.sleep(1);

        display = browser.getCssProperty('#modal-puzzles', 'display');

        assert.equal(display.value, 'block');
    });
    it('steps', function () {
        browser.url('http://localhost:3000/editor');
        browser.click('#nav-header-steps-btn');

        sleep.sleep(1);

        display = browser.getCssProperty('#modal-steps', 'display');

        assert.equal(display.value, 'block');
    });
});
