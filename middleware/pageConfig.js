const Config = require('../models/Config');

/**
 * Middleware die automatisch pageConfig ophaalt op basis van activePage
 */
async function pageConfigMiddleware(req, res, next) {
    const originalRender = res.render;
    
    res.render = async function(view, options = {}) {
        // Als er een activePage is, haal de config op
        if (options.activePage) {
            try {
                const pageConfig = await Config.findOne({ pageKey: options.activePage });
                options.pageConfig = pageConfig;
            } catch (err) {
                console.error(`Error fetching page config for ${options.activePage}:`, err);
                options.pageConfig = null;
            }
        }
        originalRender.call(this, view, options);
    };
    
    next();
}

module.exports = pageConfigMiddleware;