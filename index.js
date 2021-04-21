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
    const bookingsCollection = client.db("abshipgroup").collection("bookings");

    app.post('/addService', (req, res) => {
        const service = req.body;
        const name = service.name;
        const desc = service.desc;
        const bgImage = service.bgImage;
        const icon = req.files.icon;
        const newIcon = icon.data;
        const encIcon = newIcon.toString('base64');

        var iconImg = {
            contentType: icon.mimetype,
            size: icon.size,
            img: Buffer.from(encIcon, 'base64')
        };

        servicesCollection.insertOne({name, desc, bgImage, iconImg})
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

    app.get('/service/:id', (req, res) => {
        servicesCollection.find({_id: ObjectID(req.params.id)})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.delete('/deleteService/:id', (req, res) => {
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

    app.get('/admins', (req, res) => {
        adminsCollection.find({})
            .toArray((err, admins) => {
                res.send(admins);
            })
    });

    app.post('/isAdmin', (req, res) => {
        const email = req.body.emailID;
        adminsCollection.find({ email: email })
            .toArray((err, admins) => {
                res.send(admins.length > 0);
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

    app.post('/bookService', (req, res) => {
        bookingsCollection.insertOne(req.body)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.get('/bookings', (req, res) => {
        bookingsCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.get('/bookingsByClient/:email', (req, res) => {
        const email = req.params.email;
        console.log(email)
        bookingsCollection.find({ "user.email": email })
            .toArray((err, bookings) => {
                res.send(bookings);
            })
    })

    // crud update
    app.patch('/update/:id', (req, res) => {
        bookingsCollection.updateOne({ _id: ObjectID(req.params.id) },
            {
                $set: { status: req.body.updatedStatus }
            }
        )
            .then(result => res.send(result.modifiedCount > 0))
    })

});


app.listen(process.env.PORT || port)