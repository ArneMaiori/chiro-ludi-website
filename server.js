require("dotenv").config();
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const path = require("path");
const nodemailer = require('nodemailer');

const nieuwsRouter = require('./routes/nieuws');
const adminRouter = require('./routes/admin');
const nieuwsAdminRouter = require('./routes/nieuwsAdmin');
const leidingRouter = require('./routes/leiding');
const leidingAdminRouter = require('./routes/leidingAdmin');

const pageConfigMiddleware = require('./middleware/pageConfig');

const Nieuws = require('./models/Nieuws');
const Config = require('./models/Config');
const Leiding = require('./models/Leiding');

/// ---------- Configurations ---------- ///
const app = express();

// Session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
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
// GET / - Home pagina
app.get('/', async (req, res) => {
    let recentNieuws = [];

    // Get de 5 recenste nieuwsberichten
    try {
        recentNieuws = await Nieuws.find().sort({ date: -1 }).limit(5);
    } catch (err) {
        console.error('Error fetching nieuws posts:', err);
    }

    res.render('pages/home', {
        isAdmin: req.session.isAdmin || false,
        activePage: 'home',
        recentNieuws,
    });
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

/**
 * @todo chiro email + pass opvragen
 */
// POST /submit-contact - stel vraag aan email
app.post('/submit-contact', async (req, res) => {
    const { naam, email, onderwerp, bericht } = req.body;

    // Configuratie
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'arne.maiori@gmail.com',
            pass: 'tmougilqlwnbdysm'
        }
    });

    // Definieer de e-mailinhoud
    const mailOptions = {
        from: 'Formulier Chiro Ludi <arne.maiori@gmail.com>',
        to: 'arne.maiori@gmail.com',
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

// Andere routes
app.use('/nieuws', nieuwsRouter);
app.use('/admin', adminRouter);
app.use('/nieuws/admin', nieuwsAdminRouter);
app.use('/admin', adminRouter);
app.use('/leiding', leidingRouter);
app.use('/leiding/admin', leidingAdminRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});