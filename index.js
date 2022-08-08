

// slug is an alias user can choose.
// then we add nanoid generated id to it.


import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'
import yup from 'yup'
import { nanoid } from 'nanoid'

const app = express()

app.use(helmet())
app.use(morgan('tiny'))
app.use(cors())
app.use(express.json())
app.use(express.static('./public'));

app.get('/url/:id', (res, req) => {
    // TODO: get a short url by id
});

app.get('/:id', (req, res) => {
    // TODO: redirect to url
    res.json({
        message: 'short urls for your code'
    });
});


// Yup validation for short url.
const schema = yup.object().shape({
    slug: yup.string().trim().matches(/[a-z0-9_\-]/i),
    url: yup.string().trim().url().required(),
})

app.post('/url', async (req, res, next) => {
    // TODO: create a short url
    let { slug, url } = req.body;

    try {
        
        await schema.validate({ slug, url });

        if (!slug) {
            slug = nanoid(5);
        }

        slug = slug.toLowerCase();

        res.json({
            slug,
            url
        })
        
    } catch (error) {
        next(error);
    }
});


// In express, a error handler has 4 params

app.use((error, req, res, next) => {

    if (error.status) {
        res.status(error.status);
    }
    else {
        res.status(500);
        /* The HTTP status code 500 is 
        a generic error response. 
        It means that the server encountered 
        an unexpected condition that prevented 
        it from fulfilling the request. 
        This error is usually returned by 
        the server when no other error code is suitable. */
    }

    res.json({
        message: error.message,
        stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack
    })
});




const port = process.env.PORT || 1337;
app.listen(port, () => {
    console.log(`Listening at localhost:${port}`);
});