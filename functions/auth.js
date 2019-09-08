const admin = require('firebase-admin');

exports.createUser = (data, context) => {
    return admin.auth().createUser({
        email: data.email,
        emailVerified: false,
        password: data.password,
        displayName: data.name,
        disabled: false
    })
    .then(function(userRecord) {
        // See the UserRecord reference doc for the contents of userRecord.
        console.log("Successfully created new user:", userRecord.uid);
        return userRecord.uid;
    })
    .catch(function(error) {
        console.log("Error creating new user:", error);
        return error
    });
}

exports.login = (data) => {

}

exports.logout = (data) => {

}