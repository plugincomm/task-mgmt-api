const { expressjwt: jwt } = require('express-jwt');

function authJwt() {
    const secret = process.env.SECRET;
    const api = process.env.API_URL;

    return jwt({
        secret,
        algorithms: ['HS256'],
        isRevoked: isRevoked
    }).unless({
        path: [
            { url: /^\/public\/upload\/videoimg\/(.*)/, methods: ['GET', 'DELETE', 'POST', 'PUT', 'OPTIONS'] },  
            { url: /^\/public\/upload\/video\/(.*)/, methods: ['GET', 'DELETE', 'POST', 'PUT', 'OPTIONS'] },  
            { url: /\/api\/v1\/catvideos(.*)/, methods: ['GET', 'DELETE', 'POST', 'PUT', 'OPTIONS'] },
            { url: /\/api\/v1\/uploadvideos(.*)/, methods: ['GET', 'DELETE', 'POST', 'PUT', 'OPTIONS'] },
            { url: /\/api\/v1\/users(.*)/, methods: ['GET', 'DELETE', 'POST', 'PUT', 'OPTIONS'] },
            `${api}/users/login`,
            `${api}/users/register`
        ]
    });
}

async function isRevoked(req, payload, done) {
    try {
        if (!payload.isAdmin) {
            console.log(`Token revoked for user ${payload.userId}`);
            return done(null, true);
        }
        done();
    } catch (err) {
        console.error(`Error in isRevoked: ${err.message}`);
        done(err, true);
    }
}

module.exports = authJwt;
