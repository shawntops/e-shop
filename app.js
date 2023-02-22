const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors')
require('dotenv/config');
const authJwt = require('./helpers/jwt')
const errorHandler = require('./helpers/error-handler')

app.use(cors())
app.options('*', cors())


const productsRouter = require('./routers/products')
const categoriesRouter = require('./routers/categories')
const ordersRouter = require('./routers/orders')
const usersRouter = require('./routers/users')

const api = process.env.API_URL;

//middlewares
app.use(express.json())
app.use(morgan('tiny'))
app.use(authJwt())
app.use(errorHandler)


app.use(`${api}/products`, productsRouter)
app.use(`${api}/orders`, ordersRouter)
app.use(`${api}/categories`, categoriesRouter)
app.use(`${api}/users`, usersRouter)




mongoose.connect(process.env.CONNECT_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'eshop-db'
})
    .then(() => {
        console.log('database connection is ready...')
    })
    .catch((err) => {
        console.log(err)
    })

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});