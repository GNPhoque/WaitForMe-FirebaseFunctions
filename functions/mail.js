const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
    host: 'smtp-fr.securemail.pro',
    port: 465,
    secure: true,
    auth: {
        user:'support@waitforme.fr',
        pass:'Phoque8173'
    }
});

//Generates a MD5HASH of a text
md5 = (string) => {
    return crypto.createHash('md5').update(string).digest('hex');
};

sendMail = async (to, subject, text, html) => {
    return new Promise((resolve, reject) => {
        const mailOptions = {
            from: 'support@waitforme.fr',
            to: to,
            subject: subject,
            text: text,
            html: html
        }; 
        transporter.sendMail(mailOptions, (error, info) => {
            if(error){
                console.log({status:'error', info:{error, info}});
                reject(false);
            }
            else{
                resolve(true);
            }
        });
    })
}

exports.sendActivateAccountEmail = (user) => {
    var userIDHash = md5(user.uid);
    admin.database().ref('Email-Verifications/' + userIDHash).set({userId:user.uid});
    var verificationLink = "https://www.waitforme-bf9ec.web.app/confirm_email/" + userIDHash;
    const subject = 'WaitForMe - Email verification';
    const mailHtml = `<b>Hello, <br>
    You recently joined WaitForMe and we thank you for this.<br>
    You just need to click the following link to confirm your email address. </b><br>
    If the link does not work you may need to copy and paste it in your web explorer manually.<br>
    <br>
    <a href="${verificationLink}">${verificationLink}</a><br>
    <br>
    Thanks again for joining in!<br>
    <br>
    <i>This is an automatic mail from WaitForMe, please do not use the reply function.<br>
    If you need to contact us, please send a mail to support@waitforme.fr</i>`;
    return sendMail(user.email, subject, '', mailHtml).then(value =>{
        return 'OK';
    }).catch(error=>{
        return 'ERROR';
    });
}

exports.confirmMail = (data) => {
    return admin.database().ref(`/Email-Verifications/${data.uid}`).once('value')
    .then((snapshot) => {
        let uid = snapshot.val().userId;
        return admin.auth().updateUser(uid, { emailVerified : true })
        .then((userRecord)=>{
            return admin.database().ref(`/Email-Verifications/${userRecord.uid}`).set(null)
            .then(()=>{
                console.log('email verified');
                return { uid: uid };
            })
            .catch((error)=>{
                console.log(error);
                return error;                    
            })
        })
    })
    .catch((error)=>{
        console.log(error);
        return error;
    })
}

exports.sendMail = (data) => {
    return sendmail(data.dest, data.subject, data.message, '')
    .then(()=>{
        return 'OK';
    })
    .catch((error) => {
        console.log(error);
        return 'ERROR';
    })
}