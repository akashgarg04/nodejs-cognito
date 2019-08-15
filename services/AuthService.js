global.fetch = require('node-fetch');
global.navigator = () => null;
const config = require ('config');
const request = require('request');
const jwkToPem = require('jwk-to-pem');
const jwt = require('jsonwebtoken');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');

const pool_region = config.get('PoolRegion');
const poolData = {
    UserPoolId: config.get('UserPoolId'),
    ClientId: config.get('ClientId')
};

const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

exports.Register = function (body, callback) {
    var name = body.name;
    var email = body.email;
    var password = body.password;
    
    if (body.question.length <= 0 || 
        body.answer.length <= 0   ||
        name.length <= 0          ||
        email.length <= 0         ||
        password.length <= 0
    )
    {
        return(500);
    }

    var attributeList = [];
    		
    var dataEmail = {
        Name : 'email', 
        Value : email
    };
    
    var dataPersonalName = {
        Name : 'name', 
        Value : name
    };

    var question = {
        Name : 'custom:question', 
        Value : body.question
    };

    var answer = {
        Name : 'custom:answer', 
        Value : body.answer
    };


    var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
    var attributePersonalName = new AmazonCognitoIdentity.CognitoUserAttribute(dataPersonalName);
    var ques = new AmazonCognitoIdentity.CognitoUserAttribute(question);
    var answ = new AmazonCognitoIdentity.CognitoUserAttribute(answer);

    attributeList.push(attributeEmail);
    attributeList.push(attributePersonalName);
    attributeList.push(ques);
    attributeList.push(answ);
        
    userPool.signUp(email, password, attributeList, null, function (err, result) {
        if (err)
            callback(err);
        var cognitoUser = result.user;
        callback(null, cognitoUser);
    })
};


exports.Login = function (body, callback) {
    var userName = body.email;
    var password = body.password;

    var userData = {
        Username : userName,
        Pool : userPool
    }
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    console.log ('Amazon Login Successful');

    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
        Email: userName,
        Password: password
    });
    
    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
            console.log ('User Login Successful');
            var accesstoken = result.getAccessToken().getJwtToken();
            callback(null, accesstoken);
         },
        onFailure: (function (err) {
            console.log ('User Login Failed');
            callback(err);
        })
    })
 };


exports.Validate = function(token, callback){
    request({
        url : `https://cognito-idp.${pool_region}`
                    +`.amazonaws.com/${poolData.UserPoolId}/`
                    +`.well-known/jwks.json`,
        json : true
    }, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            pems = {};
            var keys = body['keys'];
            for(var i = 0; i < keys.length; i++) {
                var key_id = keys[i].kid;
                var modulus = keys[i].n;
                var exponent = keys[i].e;
                var key_type = keys[i].kty;
                var jwk = { kty: key_type, n: modulus, e: exponent};
                var pem = jwkToPem(jwk);
                pems[key_id] = pem;
            }
            
            var decodedJwt = jwt.decode(token, {complete: true});
            if (!decodedJwt) {
                console.log("Not a valid JWT token");
                callback(new Error('Not a valid JWT token'));
            }
            
            var kid = decodedJwt.header.kid;
            var pem = pems[kid];
            if (!pem) {
                console.log('Invalid token');
                callback(new Error('Invalid token'));
            }
            
            jwt.verify(token, pem, function(err, payload) {
                if(err) {
                    console.log("Invalid Token.");
                    callback(new Error('Invalid token'));
                } else {
                    console.log("Valid Token.");
                    callback(null, "Valid token");
                }
            });
        } else {
            console.log("Error! Unable to download JWKs");
            callback(error);
        }
    });
 };


 exports.Profile = function (body, callback) {
    // The user should be logged-in, so get user info from the userpool
    var cognitoUser = userPool.getCurrentUser();
    if (cognitoUser != null) {
        cognitoUser.getSession(function(err, session) {
            if (err) {
                alert(err);
                return;
            }
            console.log('session validity: ' + session.isValid());
			//Set the profile info
			cognitoUser.getUserAttributes(function(err, result) {
				if (err) {
					console.log(err);
					return;
                }
                console.log('Found user profile information');
				console.log(result);
				callback(null, result);
			});			
        });
    } else {
        console.log('Error! Unable to find user in the session');
        callback(new Error());
    }
 };


 exports.Logout = function (body, callback) {
    // The user should be logged-in, so get user info from the userpool
    var cognitoUser = userPool.getCurrentUser();
    if (cognitoUser != null) {
        cognitoUser.signOut();
        console.log('User logged-out successfully');
        callback(null);
    } else {
        console.log('Error! Unable to find user in the session');
        callback(null);
    }
}