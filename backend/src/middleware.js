const { verifyJwt } = require('./auth');

async function authRequired(req, res, next) {
  try {
    const raw = req.headers.authorization || '';
    let token = null;
    if (raw.startsWith('Bearer ')) {
      token = raw.slice(7);
    } else if (req.cookies?.auth_token) {
      token = req.cookies.auth_token;
    }
    if (!token) return res.status(401).json({ error: 'Missing token' });
    const decoded = verifyJwt(token);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { authRequired };
