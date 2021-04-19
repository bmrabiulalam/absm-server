const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.boucr.mongodb.net/abshipgroup?retryWrites=true&w=majority`;

const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload());

const port = 5000;

app.get('/', (req, res) => {
    res.send('Hello World!')
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const servicesCollection = client.db("abshipgroup").collection("services");
    const adminsCollection = client.db("abshipgroup").collection("admins");
    const commentsCollection = client.db("abshipgroup").collection("comments");

    app.post('/addService', (req, res) => {
        const service = req.body;
        const bgImage = req.files.bgImage;
        const icon = req.files.icon;
        const name = service.name;
        const desc = service.desc;
        const newBgImage = bgImage.data;
        const newIcon = icon.data;
        const encBgImage = newBgImage.toString('base64');
        const encIcon = newIcon.toString('base64');

        var bgImg = {
            contentType: bgImage.mimetype,
            size: bgImage.size,
            img: Buffer.from(encBgImage, 'base64')
        };

        var iconImg = {
            contentType: icon.mimetype,
            size: icon.size,
            img: Buffer.from(encIcon, 'base64')
        };

        servicesCollection.insertOne({name, desc, bgImg, iconImg})
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    });

    app.get('/services', (req, res) => {
        servicesCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.delete('/deleteService/:id', (req, res) => {
        console.log('service id: ')
        console.log(req.params.id)
        servicesCollection.deleteOne({ _id: ObjectID(req.params.id) })
            .then(result => res.send(result.deletedCount > 0))
    })

    app.post('/addAdmin', (req, res) => {
        const name = req.body.name;
        const email = req.body.email;

        adminsCollection.insertOne({ name, email })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.post('/addComment', (req, res) => {
        const service = req.body;
        const name = service.name;
        const designation = service.designation;
        const company = service.company;
        const comment = service.comment;

        const image = req.files.image;
        const newImage = image.data;
        const encIcon = newImage.toString('base64');

        var img = {
            contentType: image.mimetype,
            size: image.size,
            image: Buffer.from(encIcon, 'base64')
        };

        commentsCollection.insertOne({name, designation, company, comment, img})
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    });

    app.get('/comments', (req, res) => {
        commentsCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.post('/appointmentsByDate', (req, res) => {
        const date = req.body;
        const email = req.body.email;
        doctorCollection.find({ email: email })
            .toArray((err, doctors) => {
                const filter = { date: date.date }
                if (doctors.length === 0) {
                    filter.email = email;
                }
                appointmentCollection.find(filter)
                    .toArray((err, documents) => {
                        console.log(email, date.date, doctors, documents)
                        res.send(documents);
                    })
            })
    })

    app.get('/doctors', (req, res) => {
        doctorCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

    app.post('/isDoctor', (req, res) => {
        const email = req.body.email;
        doctorCollection.find({ email: email })
            .toArray((err, doctors) => {
                res.send(doctors.length > 0);
            })
    })

});


app.listen(process.env.PORT || port)