const express = require('express')
const cors = require('cors')
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion } = require('mongodb');

require('dotenv').config()
const app = express()
// Middleware
app.use(cors())
app.use(express.json())





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xwh8ees.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    const clothesCategoryCollection = client.db('clothesHub').collection('clothesCategory')
    const tshirtsCollection = client.db('clothesHub').collection('tshirts')
    const hoodiesCollection = client.db('clothesHub').collection('hoodies')
    const jeansCollection = client.db('clothesHub').collection('jeans')

    app.get('/category', async (req, res) => {
        const query = {}
        const result = await clothesCategoryCollection.find(query).toArray()
        res.send(result)
    })
}
run().catch(console.log)


app.get('/', async (req, res) => {
    res.send('Clothes Hub Server Running')
})
app.listen(port, () => console.log(`Clothes hub running on port ${port}`))