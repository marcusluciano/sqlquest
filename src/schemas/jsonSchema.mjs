
/** @typedef {import('../sql/sql-data-types.mjs').sqlDataTypes} sqlDataTypes */

/** 
 * @typedef jsonSchema
 * @property {string} $id - URL of the JSON schema folder
 * @property {string} $schema - "https://json-schema.org/draft/2020-12/schema", perhaps
 * @property {string} type - "object"
 * @property {string} description - Queried table name
 * @property {Array<keyof jsonSchemaProperty>} required - Required field array
 * @property {Array<keyof jsonSchemaProperty>} [sqlPrimaryKey] - SQL key constraint columns
 * @property {string} [sqlTableName] - SQL table name
 * @property {Object<string, jsonSchemaProperty|jsonSchemaRef|*>} properties - SQL columns
 *
 * @typedef jsonSchemaProperty
 * @property {string} type - 'string', 'number', 'boolean'
 * @property {number} [maxLength] - of string
 * @property {number} [minimum] - of number
 * @property {number} [maximum] - of number
 * @property {string} [sqlColumnName]
 * @property {keyof sqlDataTypes} [sqlDataType] - sqlDataTypes
 * @property {boolean} [nullable] - in SQL database
 * @property {number} [precision] - For decimal types
 * @property {number} [decimals] - For decimal types
 * 
 * @typedef jsonSchemaRef
 * @property {jsonSchema} $ref - Reference type for 1:N relationships
 */
