/** 
 * @file Limit concurrent calls to the number of CPUs available
 * 
 * @copyright Copyright (C) 2020 - 2024 FormaWare LLC All rights reserved.
 * @license WTFPL
 * @author Mark Lucas <MLucas@FormulatorUS.com> 
 * @author FormaWare LLC
 */

/** Limit concurrent calls to the number of cpus >= 4 */
import pLimit from 'p-limit';
import os from 'node:os';

/** @const {pLimit} pLimiter */
const pLimiter = pLimit(os.cpus().length > 4 ? os.cpus().length : 4);

export default pLimiter;
