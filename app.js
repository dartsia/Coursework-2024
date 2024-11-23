const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, './.env') })
let express = require('express');
const { listenToStateChanges } = require('./controllers/emailSendController');
let webRoutes = require('./routes/index');
listenToStateChanges();


const app = express();
const PORT = process.env.PORT || 3000;


// view engine setup
app.set('views', path.join(__dirname, 'view'));
app.set('view engine', 'hbs');

app.use(express.json());
app.use('/', webRoutes);

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`${process.env.PORT}`);
});
