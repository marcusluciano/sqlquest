/**
 * @fileoverview SQL safe string character injector RegEx 
 * and accompanying replacement string
 * 
 * @copyright Copyright (C) 2020 - 2024 FormaWare LLC All rights reserved.
 * @license MIT
 * @author Mark Lucas <MLucas@FormulatorUS.com> 
 * @author FormaWare LLC
 * 
 * @module sql-regex
 * 
 * @export sqlRegEx()
 * @export numRegEx()
 * @export dateRegEx()
 */

export const sqlRegEx = {
    /** SQL character search and replace */
    quote: {
        /** @type {RegExp} */
        regEx: /\'/g,
        /** @type {string} */
        sqlSafe: `\\'`,
    },
    doubleQuote: {
        /** @type {RegExp} */
        regEx: /\"/g,
        /** @type {string} */
        sqlSafe: `\\"`,
    },
    backslash: {
        /** @type {RegExp} */
        regEx: /\\/g,
        /** @type {string} */
        sqlSafe: `\\\\`,
    },
    controlChars: {
        /** @type {RegExp} */
        regEx: /[\u0000-\u001F]/g,
        /** @type {string} */
        sqlSafe: `\\$&`,
    },
    null: {
        /** @type {RegExp} */
        regEx: /\0/g,
        /** @type {string} */
        sqlSafe: `\\0`,
    },
    backSpace: {
        /** @type {RegExp} */
        regEx: /\b/g,
        /** @type {string} */
        sqlSafe: `\\b`
    },
    tab: {
        /** @type {RegExp} */
        regEx: /\t/g,
        /** @type {string} */
        sqlSafe: `\\t`,
    },
    cr: {
        /** @type {RegExp} */
        regEx: /\r/g,
        /** @type {string} */
        sqlSafe: `\\r`,
    },
    newline: {
        /** @type {RegExp} */
        regEx: /\n/g,
        /** @type {string} */
        sqlSafe: `\\n`,
    },
    formfeed: {
        /** @type {RegExp} */
        regEx: /\f/g,
        /** @type {string} */
        sqlSafe: `\\f`,
    },
    x1a: {
        /** @type {RegExp} */
        regEx: /\x1a/g,
        /** @type {string} */
        sqlSafe: `\\Z`,
    },
}

export const numRegEx = {
    /** Test for digits and possible decimals for SINGLE CHAR parse */
    digits: {
        /** @type {RegExp} */
        regEx: /(\d|\.|\,|\-)/
    },
    /** Test for decimal number string or floating point sans exponent */
    number: {
        /** @type {RegExp} */
        regEx: /(\-)?\d+(\.{1}\d{0,9}$)?/
    },
}

export const dateRegEx = {
    yyyymmdd: {
        /** @type {RegExp} */
        regEx: /^\d{4}[\-][0-1]{1}\d{1}[\-][0-3]{1}\d{1}/
    },

    yyyymmddhhmmss: {
        /** @type {RegExp} */
        regEx: /^\d{4}[\-]{1}[0-1]{1}\d{1}[\-]{1}[0-3]{1}\d{1}\s{1}[0-2]{1}\d{1}[\:][0-5]{1}\d{1}[\:][0-5]{1}\d{1}/
    },

    yyyymmddhhmmssTZ: {
        /** @type {RegExp} */
        regEx: /^\d{4}[\-]{1}[0-1]{1}\d{1}[\-]{1}[0-3]{1}\d{1}\s{1}[0-2]{1}\d{1}[\:]{1}[0-5]{1}\d{1}[\:][0-5]{1}\d{1}[\+\-]{1}[0-1]{1}\d{1}[\:]{1}[0-1]{1}\d{1}/
    },
    yyyymmddZhhmmss: {
        /** @type {RegExp} */
        regEx: /^\d{4}[\-]{1}[0-1]{1}\d{1}[\-]{1}[0-3]{1}\d{1}[Z]{1}[0-2]{1}\d{1}[\:]{1}[0-5]{1}\d{1}[\:]{1}[0-5]{1}\d{1}/
    },
}
