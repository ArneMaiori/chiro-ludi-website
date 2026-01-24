require("dotenv").config();
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const MongoStore = require('connect-mongo').default;
const path = require("path");
const nodemailer = require('nodemailer');

const nieuwsRouter = require('./routes/nieuws');
const adminRouter = require('./routes/admin');
const nieuwsAdminRouter = require('./routes/nieuwsAdmin');
const leidingRouter = require('./routes/leiding');
const leidingAdminRouter = require('./routes/leidingAdmin');
const actiesAdminRouter = require('./routes/actiesAdmin');
const jaarkalenderRouter = require('./routes/jaarkalender');
const jaarkalenderAdminRouter = require('./routes/jaarkalenderAdmin');

const pageConfigMiddleware = require('./middleware/pageConfig');

const Nieuws = require('./models/Nieuws');
const Leiding = require('./models/Leiding');
const Actie = require('./models/Actie');

/// ---------- Configurations ---------- ///
const app = express();
app.set('trust proxy', 1);

// Session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
        mongoUrl: process.env.MONGODB_URI,
        collectionName: 'sessions' 
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(pageConfigMiddleware);

// MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("Database connected succesfully"))
    .catch(err => console.log(err));



/// ---------- Routes ---------- ///
// Specifieke routes
app.use('/nieuws', nieuwsRouter);
app.use('/admin', adminRouter);
app.use('/nieuws/admin', nieuwsAdminRouter);
app.use('/admin', adminRouter);
app.use('/leiding', leidingRouter);
app.use('/leiding/admin', leidingAdminRouter);
app.use('/acties/admin', actiesAdminRouter)
app.use('/jaarkalender', jaarkalenderRouter);
app.use('/jaarkalender/admin', jaarkalenderAdminRouter);

// GET /sitemap.xml - Genereer dynamische sitemap
app.get('/sitemap.xml', async (req, res) => {
    try {
        const nieuwsItems = await Nieuws.find().select('_id date');
        const actieItems = await Actie.find().select('_id');

        const hostname = 'https://www.chiroludi.com';

        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        // Statische pagina's
        const staticRoutes = [
            { loc: '/', changefreq: 'daily', priority: '1.0' },
            { loc: '/nieuws', changefreq: 'daily', priority: '0.8' },
            { loc: '/leiding', changefreq: 'monthly', priority: '0.7' },
            { loc: '/jaarkalender', changefreq: 'monthly', priority: '0.6' },
            { loc: '/lid_worden', changefreq: 'monthly', priority: '0.6' },
            { loc: '/contact', changefreq: 'yearly', priority: '0.5' },
        ];

        staticRoutes.forEach(route => {
            sitemap += `
<url>
    <loc>${hostname}${route.loc}</loc>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
</url>`;
        });


        // Dynamische nieuws posts
        nieuwsItems.forEach(item => {
            const lastmod = item.date.toISOString().split('T')[0];
            sitemap += `
<url>
    <loc>${hostname}/nieuws/${item._id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
</url>`;
        });

        // Dynamische acties
        actieItems.forEach(item => {
            sitemap += `
<url>
    <loc>${hostname}/acties/${item._id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
</url>`;
        });

        sitemap += `
</urlset>`;

        res.header('Content-Type', 'application/xml');
        res.send(sitemap);

    } catch (err) {
        console.error("Fout bij genereren sitemap:", err);
        res.status(500).send('Kon sitemap niet genereren');
    }
});


// GET / - Home pagina
app.get('/', async (req, res) => {
    let recentNieuws = [];
    let acties = [];

    // Get de 5 recenste nieuwsberichten
    try {
        recentNieuws = await Nieuws.find().sort({ date: -1 }).limit(5);
    } catch (err) {
        console.error('Error fetching nieuws posts:', err);
    }

    // Get alle acties in order
    try {
        acties = await Actie.find().sort({ order: 1 });
    } catch (err) {
        console.error("Error fetching acties:", err);
    }

    res.render('pages/home', {
        isAdmin: req.session.isAdmin || false,
        activePage: 'home',
        recentNieuws,
        acties
    });
});

// GET /acties/:id - Detail pagina voor een actie
app.get('/acties/:id', async (req, res) => {
    try {
        const actie = await Actie.findById(req.params.id);
        if (!actie) return res.redirect('/');

        res.render('pages/post_detail', {
            post: {
                title: actie.title,
                imageUrl: actie.imageUrl,
                description: actie.description,
            },
            backLink: '/',
            backText: 'Terug naar home',
            isAdmin: req.session.isAdmin || false,
            activePage: 'home',
            pageTitle: actie.title
        });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

// GET /contact - Contact pagina
app.get('/contact', async (req, res) => {
    let hoofdleidingen = [];

    try {
        hoofdleidingen = await Leiding.find({ isHoofdleiding: true })
            .sort({ name: 1 })
            .select('name phone email imageUrl');
    } catch (err) {
        console.error('Error fetching hoofdleiding:', err);
    }

    res.render('pages/contact', {
        isAdmin: req.session.isAdmin || false,
        activePage: 'contact',
        hoofdleidingen,
    });
});


// GET /privacy - Privacyverklaring
app.get('/privacy', (req, res) => {
    res.render('pages/privacy', {isAdmin: req.session.isAdmin || false, activePage: 'home'});
})


// Tijdelijke routes voor onafgewerkte pagina's
app.get('/lid_worden', (req, res) => {
    res.render('pages/constructie', {
        activePage: req.path.substring(1),
        isAdmin: req.session.isAdmin || false
    });
});


// POST /submit-contact - stel vraag aan email
app.post('/submit-contact', async (req, res) => {
    const { naam, email, onderwerp, bericht } = req.body;

    // Configuratie
    const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        family: 4
    }
    });

    // Definieer de e-mailinhoud
    const mailOptions = {
        from: `Formulier Chiro Ludi <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: `Website vraag: ${onderwerp || 'Geen onderwerp'}`,
        html: `
            <p><b>Naam:</b> ${naam}</p>
            <p><b>E-mail:</b> ${email}</p>
            <p><b>Bericht:</b> ${bericht}</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.redirect('/contact?status=success');
    } catch (error) {
        console.error('Fout bij het versturen van mail:', error);
        res.redirect('/contact?status=error');
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});