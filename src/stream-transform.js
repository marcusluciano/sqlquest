/** 
 * @fileoverview Transform an object stream into a character stream
 * 
 * @copyright Copyright (C) 2020 - 2024 FormaWare LLC All rights reserved.
 * @license WTFPL
 * @author Mark Lucas <MLucas@FormulatorUS.com>
 * @author FormaWare LLC
 * 
 * @exports @default streamTransObjToChar()
 * 
 * @example .pipe(streamTransObjToChar())
 */

import { Transform } from 'node:stream';

/** Converts an object stream into a character string stream */
export default function streamTransObjToChar () {
    return new Transform({
        objectMode: true,
        transform: (data, _, done) => {
            done(null, JSON.stringify(data))
        }
    })
}
