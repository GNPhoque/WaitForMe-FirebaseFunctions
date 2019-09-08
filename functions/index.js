const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const cors = require('cors')({origin: true});
const crypto = require('crypto');

admin.initializeApp();

const express = require('express');
const cookieParser = require('cookie-parser')();
const app = express();





const validateFirebaseIdToken = async (req, res, next) => {
    console.log('Check if request is authorized with Firebase ID token');
  
    if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
        !(req.cookies && req.cookies.__session)) {
      console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
          'Make sure you authorize your request by providing the following HTTP header:',
          'Authorization: Bearer <Firebase ID Token>',
          'or by passing a "__session" cookie.');
      res.status(403).send('Unauthorized');
      return;
    }
  
    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      console.log('Found "Authorization" header');
      // Read the ID Token from the Authorization header.
      idToken = req.headers.authorization.split('Bearer ')[1];
    } else if(req.cookies) {
      console.log('Found "__session" cookie');
      // Read the ID Token from cookie.
      idToken = req.cookies.__session;
    } else {
      // No cookie
      res.status(403).send('Unauthorized');
      return;
    }
  
    try {
      const decodedIdToken = await admin.auth().verifyIdToken(idToken);
      console.log('ID Token correctly decoded', decodedIdToken);
      req.user = decodedIdToken;
      next();
      return;
    } catch (error) {
      console.error('Error while verifying Firebase ID token:', error);
      res.status(403).send('Unauthorized');
      return;
    }
  };
  
  app.use(cors);
  app.use(cookieParser);
  app.use(validateFirebaseIdToken);
  app.get('/hello', (req, res) => {
    res.send(`Hello ${req.user.name}`);
  });
  
  // This HTTPS endpoint can only be accessed by your Firebase Users.
  // Requests need to be authorized by providing an `Authorization` HTTP header
  // with value `Bearer <Firebase ID Token>`.
  exports.app = functions.https.onRequest(app);

































const database = admin.database();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'assistance.waitforme@gmail.com',
        pass: 'fuxwyvxcyxftrotc'
    }
});

//Generates a MD5HASH of a text
md5 = (string) => {
    return crypto.createHash('md5').update(string).digest('hex');
};

sendMail = async (to, subject, text, html) => {
    return new Promise((resolve, reject) => {
        const mailOptions = {
            from: 'assistance.waitforme@gmail.com',
            to: to,
            subject: subject,
            text: text,
            html: html
        }; 
        transporter.sendMail(mailOptions, (error, info) => {
            if(error){
                console.log({status:'error', info:error});
                reject(false);
            }
            else{
                console.log({status:'Success', info:'Sended'});
                resolve(true);
            }
        });

    })
}

//Block requests coming from unknown IPs
testIp = (req) => {
            return req.headers['x-appengine-user-ip'] || req.header['x-forwarded-for'] || req.connection.remoteAddress == "92.154.2.217";
}

exports.signIn = functions.https.onRequest((req, res) => {
    cors((req, res) => {
        functions.si
    })
})

//TEST RETURN VALUE
exports.sendActivateAccountMail = functions.auth.user().onCreate((user) => {
    console.log(`EmailVerified = ${user.emailVerified}`);
        var userIDHash = md5(user.uid);
        database.ref('Email-Verifications/' + userIDHash).set({userId:user.uid});
        var verificationLink = "https://www.waitforme-bf9ec.web.app/confirm_email/" + userIDHash;
        const subject = 'WaitForMe - Email verification';
        const mailHtml = `<b>Hello, 
        You recently joined WaitForMe and we thank you for this.
        You just need to click the following link to confirm your email address. </b>
        If the link does not work you may need to copy and paste it in your web explorer manually.
        
        <a href="${verificationLink}">
        
        Thanks again for joining in!
        
        <i>This is an automatic mail from WaitForMe, please do not use the reply function.
        If you need to contact us, please send a mail to assitance.waitforme@gmail.com`;
        sendMail(user.email, subject, '', mailHtml).then(value =>{
            console.log('SUCCESS', value);
            return 'OK';
        }).catch(error=>{
            console.log('ERROR', error);
            return 'ERROR';
        });
})

//Confirm user mail
exports.confirmMail = functions.https.onRequest((req, res) => {
    cors(req,res,()=>{
        console.log('inCors');
        database.ref(`/Email-Verifications/${req.body.uid}`).once('value', (snapshot) => {
            console.log(snapshot.val());
            let uid = snapshot.val().userId;
            admin.auth().updateUser(uid, { emailVerified : true })
            .then(()=>{
                console.log(`Mail for userId : ${uid} is confirmed`);
                database.ref(`/Email-Verifications/${req.body.uid}`).remove()
                .then(()=>{
                    console.log(`Reference in Email-Verifications has been removed`);
                    return res.send('Ok');
                })
                .catch(()=>{
                    console.log(error);
                    return res.send(error);                    
                })
            })
            .catch((error)=>{
                console.log(error);
                return res.send(error);
            })
        })
    })
})

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




//ZOMBIE CODE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//TESTS
exports.addItem = functions.https.onRequest((req, res) => {
    let dbItems = database.ref('/items');
    return cors(req, res, () => {
        if(req.method !== 'POST') {
            return res.status(401).json({
                message: 'Not allowed'
            })
        }
        console.log(req.body)
        const item = req.body.item
        dbItems.push({ item });
        let items = [];
        return dbItems.on(
            'value', 
            (snapshot) => {
                snapshot.forEach((item) => {
                    items.push({
                        id: item.key,
                        items: item.val().item
                    });
                });
                res.status(200).json(items)
            }, 
            (error) => {
                res.status(error.code).json({
                message: `Something went wrong. ${error.message}`
            })
        })
    })
})