const express = require('express')
const cors = require('cors')
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken')

require('dotenv').config()
const app = express()
// Middleware
app.use(cors())
app.use(express.json())

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).send('Unauthorized Access')
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Access' })
        }
        req.decoded = decoded
        next()
    })
}



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xwh8ees.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    const clothesCategoryCollection = client.db('clothesHub').collection('clothesCategory')
    const tshirtsCollection = client.db('clothesHub').collection('tshirts')
    const hoodiesCollection = client.db('clothesHub').collection('hoodies')
    const jeansCollection = client.db('clothesHub').collection('jeans')
    const usersCollection = client.db('clothesHub').collection('users')
    const bookingsCollection = client.db('clothesHub').collection('bookings')
    const myProductsCollection = client.db('clothesHub').collection('myProducts')
    const myWishlistsCollection = client.db('clothesHub').collection('myWishLists')
    const advertisementsCollection = client.db('clothesHub').collection('advertisements')

    const verifySeller = async (req, res, next) => {
        // console.log('insideVerifyAdmin', req.decoded)
        const decodedEmail = req.body.email
        const query = { email: decodedEmail }
        const user = await usersCollection.findOne(query)
        // console.log('Veryfy seller', user)
        if (user.type !== 'Seller') {
            return res.status(403).send({ message: 'Forbiddden access' })
        }
        next()
    }

    app.get('/jwt', async (req, res) => {
        const email = req.query.email
        console.log('jwt', email)
        const query = { email: email }
        const user = await usersCollection.findOne(query)
        if (user) {
            const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1d' })
            return res.send({ accessToken: token })
        }

        res.status(403).send({ accessToken: '' })
    })
    app.get('/myproducts', async (req, res) => {
        const query = {}
        const result = await myProductsCollection.find(query).toArray()
        res.send(result)
    })
    app.post('/myproducts', verifySeller, async (req, res) => {
        const product = req.body
        // console.log('user', product)
        const result = await myProductsCollection.insertOne(product)
        res.send(result)
    })
    app.get('/mywishlists', async (req, res) => {
        const query = {}
        const result = await myWishlistsCollection.find(query).toArray()
        res.send(result)
    })
    app.post('/mywishlists', async (req, res) => {
        const product = req.body
        // console.log('user', product)
        const result = await myWishlistsCollection.insertOne(product)
        res.send(result)
    })

    app.get('/advertisements', async (req, res) => {
        const query = {}
        const result = await advertisementsCollection.find(query).toArray()
        res.send(result)
    })
    app.post('/advertisements', async (req, res) => {
        const product = req.body
        // console.log('user', product)
        const result = await advertisementsCollection.insertOne(product)
        res.send(result)
    })
    app.put('/myproducts/:id', async (req, res) => {
        const id = req.params.id
        const filter = { _id: ObjectId(id) }
        const options = { upsert: true }
        const updatedDoc = {
            $set: {
                advertised: true
            }
        }
        const result = await myProductsCollection.updateOne(filter, updatedDoc, options)
        res.send(result)
    })
    app.delete('/myproducts/:id', async (req, res) => {
        const id = req.params.id
        const filter = { _id: ObjectId(id) }
        const result = await myProductsCollection.deleteOne(filter)
        res.send(result)
    })
    app.get('/category', async (req, res) => {
        const query = {}
        const result = await clothesCategoryCollection.find(query).toArray()
        res.send(result)
    })
    app.get('/category/:id', async (req, res) => {
        const id = req.params.id
        // console.log(id)
        if (id === '1') {
            const query = {}
            const result = await tshirtsCollection.find(query).toArray()
            return res.send(result)
        }
        if (id === '2') {
            const query = {}
            const result = await hoodiesCollection.find(query).toArray()
            return res.send(result)
        }
        if (id === '3') {
            const query = {}
            const result = await jeansCollection.find(query).toArray()
            return res.send(result)
        }
        res.send('Not Found')
    })
    app.post('/bookings/product', verifySeller, async (req, res) => {
        const user = req.body
        const category = req.body.category_name
        if (category === 'T Shirts') {
            const result = await tshirtsCollection.insertOne(user)
            return res.send(result)
        }
        if (category === 'Hoodies') {
            const result = await hoodiesCollection.insertOne(user)
            return res.send(result)
        }
        if (category === 'Jeans') {
            const result = await jeansCollection.insertOne(user)
            return res.send(result)
        }



    })

    app.delete('/bookings/product/:id', async (req, res) => {
        const user = req.body
        const category = user.category_name
        console.log('Deleted category', category)
        if (category === 'T Shirts') {
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const result = await tshirtsCollection.deleteOne(filter)
            return res.send(result)
        }
        if (category === 'Hoodies') {
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const result = await hoodiesCollection.deleteOne(filter)
            return res.send(result)
        }
        if (category === 'Jeans') {
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const result = await jeansCollection.deleteOne(filter)
            return res.send(result)
        }
    })
    app.post('/users', async (req, res) => {
        const user = req.body
        // console.log('user', user)
        const result = await usersCollection.insertOne(user)
        res.send(result)
    })
    app.get('/users', verifyJWT, async (req, res) => {
        const query = {}
        const users = await usersCollection.find(query).toArray()
        res.send(users)
    })
    app.get('/users/admin/:email', async (req, res) => {
        const email = req.params.email
        // console.log(2, email)
        const query = { email }
        const user = await usersCollection.findOne(query)
        res.send({ isAdmin: user?.role === 'admin' })
    })
    app.get('/users/type/:email', async (req, res) => {
        const email = req.params.email
        // console.log(2, email)
        const query = { email }
        const user = await usersCollection.findOne(query)
        res.send(user)
    })
    app.get('/users/sellers/:email', async (req, res) => {
        const email = req.params.email
        // console.log(3, email)
        const query = { email }
        const user = await usersCollection.findOne(query)
        res.send({ isSellers: user?.type === 'Seller' })
    })
    app.get('/users/buyers/:email', async (req, res) => {
        const email = req.params.email
        // console.log(3, email)
        const query = { email }
        const user = await usersCollection.findOne(query)
        res.send({ isBuyers: user?.type === 'Buyers' })
    })
    app.delete('/users/:id', verifyJWT, async (req, res) => {
        const id = req.params.id
        const filter = { _id: ObjectId(id) }
        const result = await usersCollection.deleteOne(filter)
        res.send(result)
    })
    app.put('/users/:id', verifyJWT, async (req, res) => {
        const id = req.params.id
        const filter = { _id: ObjectId(id) }
        const options = { upsert: true }
        const updatedDoc = {
            $set: {
                verified: true
            }
        }
        const result = await usersCollection.updateOne(filter, updatedDoc, options)
        res.send(result)
    })
    app.post('/bookings', async (req, res) => {
        const booking = req.body

        // console.log(booking)

        // const query = {
        //     appointmentDate: booking.appointmentDate,
        //     treatment: booking.treatment,
        //     email: booking.email
        // }
        // const alreadyBooked = await bookingsCollection.find(query).toArray()
        // if (alreadyBooked.length) {
        //     const message = `You already booked on ${booking.appointmentDate}`
        //     return res.send({ acknowledged: false, message })
        // }
        const result = await bookingsCollection.insertOne(booking)
        res.send(result)
    })
    app.get('/bookings', verifyJWT, async (req, res) => {
        const email = req.query.email
        // console.log(email)
        // const decodedEmail = req.decoded.email
        // if (email !== decodedEmail) {
        //     return res.status(403).send({ message: "Forbidden Access" })
        // }
        // console.log('Token', req.headers.authorization)
        const query = {
            email: email
        }
        const bookings = await bookingsCollection.find(query).toArray()
        res.send(bookings)
    })
    app.get('/users/email', async (req, res) => {
        const email = req.query.email
        // console.log('inside:', email)
        const query = {
            email: email
        }
        const user = await usersCollection.find(query).toArray()
        res.send(user)
    })
}
run().catch(console.log)


app.get('/', async (req, res) => {
    res.send('Clothes Hub Server Running')
})
app.listen(port, () => console.log(`Clothes hub running on port ${port}`))