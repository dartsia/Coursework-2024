const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, './.env') })
let webRoutes = require('./routes/index');
let express = require('express');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;


/*app.use(session({
  secret: 'qwer', 
  resave: false,             
  saveUninitialized: false,  
  cookie: { secure: false } 
}));*/


app.use(express.json());
app.use('/', webRoutes);

app.listen(PORT, () => {
  console.log(`${process.env.PORT}`);
});
