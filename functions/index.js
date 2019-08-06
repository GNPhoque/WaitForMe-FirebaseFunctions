const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const cors = require('cors')({origin: true});
admin.initializeApp();

/**
* Here we're using Gmail to send 
*/
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'assistance.waitforme@gmail.com',
        pass: 'fuxwyvxcyxftrotc'
    }
});

exports.sendMail = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
      
        // getting dest email by query string
				const dest = req.body.dest;
				const subject = req.body.subject;
				const message = req.body.message;
				// return message;
        const mailOptions = {
            from: 'assistance.waitforme@gmail.com',
            to: dest,
            subject: subject,
            // html: `<p style="font-size: 16px;">Pickle Riiiiiiiiiiiiiiiick!!</p>
            //     <br />
						// 		<img src="https://images.prod.meredith.com/product/fc8754735c8a9b4aebb786278e7265a5/1538025388228/l/rick-and-morty-pickle-rick-sticker" />
						// 		<p>${message ? message : "no body"}</p>
						// ` // email content in HTML
						text: message
        };
  
        // returning result
        return transporter.sendMail(mailOptions, (erro, info) => {
            if(erro){
                return res.send(erro.toString());
            }
            return res.send('Sended');
				});
    });    
});

exports.testIp = functions.https.onRequest((req, res) => {
    cors(req, res, () => {  
        // returning result
				if(req.headers['x-appengine-user-ip'] || req.header['x-forwarded-for'] || req.connection.remoteAddress == "92.154.2.217")
				return res.send(`IP ACCEPTED : ${req.headers['x-appengine-user-ip'] || req.header['x-forwarded-for'] || req.connection.remoteAddress}`)
				return res.send(`IP REJECTED : ${req.headers['x-appengine-user-ip'] || req.header['x-forwarded-for'] || req.connection.remoteAddress}`);
    });    
});