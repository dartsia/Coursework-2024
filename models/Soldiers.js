const postgres = require("node-postgres");
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

//postgres.Connection()