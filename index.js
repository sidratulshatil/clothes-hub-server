const express = require('express')
const cors = require('cors')
const port = process.env.PORT || 5000

const app = express()
// Middleware
app.use(cors())
app.use(express.json())

app.get('/', async (req, res) => {
    res.send('Clothes Hub Server Running')
})
app.listen(port, () => console.log(`Clothes hub running on port ${port}`))