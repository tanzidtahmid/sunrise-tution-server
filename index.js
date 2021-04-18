const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs-extra')
const bodyParser = require('body-parser');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;


const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()


const app = express()



app.use(bodyParser.json())
app.use(cors())
app.use(express.static('services'))
app.use(fileUpload())

const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Hello World!')
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nvcgk.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const serviceCollection = client.db("assignmentEleven").collection("services");
    const reviewsCollection = client.db("assignmentEleven").collection("reviews");
    const singleServicesCollection = client.db("assignmentEleven").collection("singleServices");
    const adminsCollection = client.db("assignmentEleven").collection("admins");


      app.get('/services',(req,res)=>{
         serviceCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
      })

    app.post('/addServices', (req, res) => {
        const file = req.files.file;
        const title = req.body.title;
        const description = req.body.description;
        console.log(file, title, description);
        const filePath = `${__dirname}/services/${file.name}`
        file.mv(filePath, err => {
            if (err) {
                console.log(err)
                return res.status(500).send({ msg: 'Failed To Upload The Image' })
            }
            const newImg = fs.readFileSync(filePath);
            const enImg = newImg.toString('base64');
            var image = {
                contetType: req.files.file.mimetype,
                size: req.files.file.size,
                img: Buffer(enImg, 'base64')
            };
            serviceCollection.insertOne({ title, description, image })
                .then(result => 
                    fs.remove(filePath, error => {
                        if (error) {
                            console.log(error)
                        }
                        res.send(result.insertedCount > 0)
                    })
                )

        })
    })


    app.post('/addReview', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const schoolName = req.body.schoolName;
        const reviewText = req.body.reviewText;
        console.log(file, name, schoolName,reviewText);
        const filePath = `${__dirname}/reviewers/${file.name}`
        file.mv(filePath, err => {
            if (err) {
                console.log(err)
                return res.status(500).send({ msg: 'Failed To Upload The Image' })
            }
            const newImg = fs.readFileSync(filePath);
            const enImg = newImg.toString('base64');
            var image = {
                contetType: req.files.file.mimetype,
                size: req.files.file.size,
                img: Buffer(enImg, 'base64')
            };
            reviewsCollection.insertOne({ name, schoolName, reviewText, image })
                .then(result => 
                    fs.remove(filePath, error => {
                        if (error) {
                            console.log(error)
                        }
                        res.send(result.insertedCount > 0)
                    })
                )

        })
    })


    app.get('/reviews',(req,res)=>{
        reviewsCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
    })
    app.get('/getSingleService',(req,res)=>{
        console.log(req.query.email)
        singleServicesCollection.find({email : req.query.email})
        .toArray((err, documents) => {
            res.send(documents);
        })
    })
    app.get('/getAdmin',(req,res)=>{
        // console.log(req.query.email)
        adminsCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
    })

    app.get('/getSingleServices',(req,res)=>{
        // console.log(req.query.email)
        singleServicesCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
    })
    app.get('/getAllServices',(req,res)=>{
        // console.log(req.query.email)
        serviceCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
    })

    app.post('/singleService',(req,res)=>{
        const singleServices = req.body;
        console.log(singleServices)
        singleServicesCollection.insertOne(singleServices)
        .then(result => {
            res.send(result.insertedCount > 0)
          })
    })
    app.post('/addAdmin',(req,res)=>{
        const admin = req.body;
        console.log(admin)
        adminsCollection.insertOne(admin)
        .then(result => {
            res.send(result.insertedCount > 0)
            console.log(result)
          })
    })

    app.delete('/delete/:id',(req,res)=>{
        console.log(req.params.id)
        serviceCollection.deleteOne({_id:ObjectId(req.params.id)})
        .then((result)=>{
            console.log(result)
        })
    })


});


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})