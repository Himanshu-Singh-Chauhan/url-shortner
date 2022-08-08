

// slug is an alias user can choose.
// then we add nanoid generated id to it.

// Note - slug should be case insensitive for security
// not sure what it means, but just followed it for now.

import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'
import yup from 'yup'
import monk from 'monk' // library to talk to mongodb
import { nanoid } from 'nanoid'

import 'dotenv/config' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import


const app = express()

const db = monk(process.env.MONGO_URI);
const urls = db.get('urls');
urls.createIndex('slug');
// urls.createIndex({ slug: 1 }, { unique: true }); // this way is wrong

app.use(helmet())
app.use(morgan('tiny'))
app.use(cors())
app.use(express.json())
app.use(express.static('./public'));

app.get('/url/:id', async (res, req, next) => {
    // TODO: get a short url by id
});

app.get('/:id', async (req, res, next) => {
    // TODO: redirect to url
    const { id: slug } = req.params;

    try {
        const url = await urls.findOne({ slug });
    
        if (url) {
            res.redirect(url.url);
        }

        res.redirect(`/?error=${slug} not found`);
    }
    catch (error) {
        next(error);
    }
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
            // 5 means we get 36^5 permutations.
        } 
        else {
            const existing = await urls.findOne({ slug });

            if (existing) {
                throw new Error('Slug already in use. 😕');
            }
        }

        slug = slug.toLowerCase();

        const shortURL = {
            slug,
            url
        };

        const created = await urls.insert(shortURL);

        res.json(created);
        
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