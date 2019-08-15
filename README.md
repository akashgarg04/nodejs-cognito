## nodejs-cognito
*This is a Nodejs app that uses AWS cognito for login and authentication*

The app exposes routes for user signup and login using authentication through AWS Cognito.
It also exposes a route to verify the access token provided after authentication is valid or not.

The application requires an AWS account with User Pool created. 
Add the following information from Cognito as environmental variables: userpoolid, clientid and poolregion


POST request to http://localhost:3000/auth/register
The request body for signup should be similar to the following:
```
{
  "name":"user1", 
  "email": "abc@xyz.com", 
  "password": "aSecurePassword", 
  "question" : "Add a security question",
  "answer" : "Some answer"
}
```

POST request to http://localhost:3000/auth/login
The request body for login should be similar to the following:
```
{
  "email": "abc@xyz.com", 
  "password": "aSecurePassword", 
}
```

POST request to http://localhost:3000/auth/validate
The request body for validation of token should be similar to the following:
```
{
  "token":"dsadsfdsfs"
}
```
