/**
 * @file information_schema queries
 *
 * @copyright Copyright (C) 2020 - 2024 FormaWare LLC All rights reserved.
 * @license WTFPL
 * @author Mark Lucas <MLucas@FormulatorUS.com>
 * @author FormaWare LLC
 */ 

/**
 * @typedef sqlTable
 * @property {string} table_catalog
 * @property {string} table_schema
 * @property {string} table_name
 * @property {string} table_type
 */
export const sqlTablesQuery = "SELECT table_catalog,table_schema,table_name,"
        + "table_type FROM information_schema.tables"
        + " WHERE (table_type='TABLE' OR table_type='BASE TABLE')"
        + " AND table_schema<>'pg_catalog'";

/**
 * @typedef sqlColumn
 * @property {string} table_catalog
 * @property {string} table_schema
 * @property {string} table_name
 * @property {string} column_name
 * @property {string|number|boolean|null} column_default
 * @property {string} is_nullable
 * @property {string} data_type
 * @property {number} character_maximum_length
 */
export const sqlColumnsQuery = "SELECT table_catalog,table_schema,table_name," 
        + "column_name,column_default,is_nullable,data_type,"
        + "character_maximum_length" 
        + " FROM information_schema.columns";

/**
 * @typedef sqlKeyConstraint
 * @property {string} table_catalog
 * @property {string} table_schema
 * @property {string} table_name
 * @property {string} column_name
 * @property {number} ordinal_position
 * @property {string} constraint_catalog
 * @property {string} constraint_schema
 * @property {string} constraint_name
 */
export const sqlKeyConstraintQuery = "SELECT table_catalog,table_schema,table_name," 
        + "column_name,ordinal_position,"
        + "constraint_catalog,constraint_schema,constraint_name"
        + " FROM information_schema.key_column_usage";

