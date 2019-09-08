const functions = require('firebase-functions');
const admin = require('firebase-admin');

const mail = require('./mail');
const auth = require('./auth');

admin.initializeApp();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//TEST CODE

exports.testOnCall = functions.https.onCall((data, context) => {
    return auth.createUser(data, context);
})

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//TRIGGERS
exports.sendActivateAccountMail = functions.auth.user().onCreate((user) => {
    return mail.sendActivateAccountEmail(user);
})

//FUNCTIONS
exports.createUser = functions.https.onCall((data, context) => {
    return auth.createUser(data);
})

exports.sendNewActivateAccountMail = functions.https.onCall((data, context) => {
    return mail.sendActivateAccountEmail(data.user);
})

exports.confirmMail = functions.https.onCall((data, context) => {
    return mail.confirmMail(data);
})

exports.sendMail = functions.https.onCall((data, context) => { 
    return mail.sendMail(data);
})