const fs = require('fs');
const path = require('path');

const VISITORS_FILE = path.join(__dirname, 'visitors.json');

const readVisitors = () => {
    try {
        if (!fs.existsSync(VISITORS_FILE)) return {};
        const content = fs.readFileSync(VISITORS_FILE, 'utf8');
        return JSON.parse(content || '{}');
    } catch (e) {
        console.error('Read error:', e);
        return {};
    }
};

const writeVisitors = (data) => {
    try {
        fs.writeFileSync(VISITORS_FILE, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Writing error:', e);
    }
};

const visitorLogger = (req, res, next) => {
    try {
        const ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
        const userAgent = req.headers['user-agent'];
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

        const visitors = readVisitors();

        if (visitors[ip]) {
            const lastVisit = new Date(visitors[ip].lastVisit);
            if (lastVisit <= oneHourAgo) {
                visitors[ip].visitCount += 1;
                visitors[ip].lastVisit = now.toISOString();
                visitors[ip].userAgent = userAgent;
            }
        } else {
            visitors[ip] = {
                ip,
                userAgent,
                visitCount: 1,
                lastVisit: now.toISOString(),
            };
        }

        writeVisitors(visitors);
        next();
    } catch (err) {
        console.error('Visitor log error:', err);
        next();
    }
};

module.exports = { visitorLogger, readVisitors };
