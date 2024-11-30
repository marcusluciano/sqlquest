/**
 * @file SQL error values; ALWAYS NEGATIVE
 * 
 * @copyright Copyright (C) 2020 - 2024 FormaWare LLC All rights reserved.
 * @license MIT
 * @author Mark Lucas <MLucas@FormulatorUS.com>
 * @author FormaWare LLC
 * 
 * @module sqlErrValues - Error numbers
 */

const sqlErrValues = {
    noPermission: -1,
    insertFailed: -2,
    updateFailed: -3,
    deleteFailed: -4,
    arrayExpected: -5,
    keyParameterMissing: -6,
    unknown: -99
};

export default sqlErrValues;
