let accountsModel = require('../models/accounts.model');

function getAllAccounts (req, res) 
{
    res.status(200).json(accountsModel);
}

function logIn(req, res)
{
    const { email, password } = req.body; //inputs from postman
    //const vars to hold msgs
    const INVALID_INPUT = 'Invalid credentials! Check email and password.';
     const LOGIN_SUCCESS_MSG = () => `Welcome ${email}! you have successfully logged in !`; 
    //find the username that matches from postman input
    const accountName = accountsModel.find(accountName => accountName.email === email);
    const accountPassword = accountsModel.find((accountPassword) => accountPassword.password === password);


    if (accountName && accountPassword) 
    {
        return res.status(200).json({
            status: true,
            message: (LOGIN_SUCCESS_MSG(email))
        })
    }
    else{
        return res.status(200).json({
            status: false,
            message: (INVALID_INPUT)
        })
    }
}

function changePassword(req, res)
{
    const { email, password, newPassword, confirmPassword } = req.body; //inputs from postman
    //const vars to hold msgs
    const INVALID_INFO = 'Invalid Email or Passwords! Check if Email or current password are correct,or new password must not match with current password.';
    const PASSWORDS_NOT_MATCH = 'Invalid input! New password must match with confirm password.';
    const PASSWORD_UPDATED_MSG = email => `User:${email}'s password has been updated`; 
    //find the email that matches from postman input
    const account = accountsModel.find(account => account.email === email && account.password === password && (newPassword && confirmPassword !== account.password ));
    const validNewPassword = (newPassword === confirmPassword);


    if ( account && password && validNewPassword ) 
    {
        account.password = newPassword;
        return res.send(PASSWORD_UPDATED_MSG(email));
    }
    else
    {
        return !newPassword || !confirmPassword || !validNewPassword ? res.send(PASSWORDS_NOT_MATCH) : res.send(INVALID_INFO);
    } 
}

function forgotPassword(req, res)
{
    const { email, secretAnswer, newPassword, confirmPassword } = req.body; //inputs from postman
    //const vars to hold msgs
    const INVALID_INFO = 'Unsuccessful! Please check you answer,or new password must not match with current password.';
    const PASSWORDS_NOT_MATCH = 'Invalid input! New password must match with confirm password.';
    const PASSWORD_UPDATED_MSG = email => `User:${email}'s password has been updated`; 
    //find the email that matches from postman input
    const account = accountsModel.find(account => account.email === email && account.secretAnswer === secretAnswer && (newPassword && confirmPassword !== account.password ));
    const validNewPassword = (newPassword === confirmPassword);


    if ( account && validNewPassword ) 
    {
        account.password = newPassword;
        return res.send(PASSWORD_UPDATED_MSG(email));
    }
    else
    {
        return !newPassword || !confirmPassword || !validNewPassword ? res.send(PASSWORDS_NOT_MATCH) : res.send(INVALID_INFO);
    } 
}


function addAccounts(req, res) 
{
    const { email, password, firstName, lastName, confirmPassword, secretQuestion, secretAnswer } = req.body;

    if (!firstName) {
        return res.status(200).json({ status: false, errorName: 'firstName', message: 'First name cannot be empty' }); 
    } else if (!lastName) {
        return res.status(200).json({ status: false, errorName: 'lastName', message: 'Last name cannot be empty' });
    } else if (!email) {
        return res.status(200).json({ status: false, errorName: 'email', message: 'Email cannot be empty' });
    } else if (!secretQuestion) {
        return res.status(200).json({ status: false, errorName: 'secretQuestion', message: 'Secret question cannot be empty' });
    } else if (!secretAnswer) {
        return res.status(200).json({ status: false, errorName: 'secretAnswer', message: 'Answer to secret question cannot be empty' });
    } else if (!password) {
        return res.status(200).json({ status: false, errorName: 'password', message: 'Password cannot be empty' });
    }
    if (firstName.match(/\d/) !== null) {
        return res.status(200).json({ status: false, errorName: 'invalidFirstName', 
        message: 'First name must not contain numbers' 
    });
    }
    if (lastName.match(/\d/) !== null) {
        return res.status(200).json({ status: false, errorName: 'invalidLastName', 
        message: 'Last name must not contain numbers' 
    });
    }
    if (email.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z]+)*$/) === null) {
        return res.status(200).json({ status: false, errorName: 'invalidFormat', 
        message: 'Invalid Email Format' 
    });
    }
    if (password !== confirmPassword) {
        return res.status(200).json({ status: false, errorName: 'confirmPassword', 
            message: 'Passwords do not match' 
        });
    }
    if (password.length >= 1 && password.length <= 7) {
        return res.status (200).json({ status: false, errorName: 'weakPassword',
            message: 'Weak Password! Password must be atleast 8 characters.'
        })
    }
    //Check email if it already exists in database
    const dupEmail = accountsModel.find(account => account.email === email);
    if (!dupEmail) {
        accountsModel.push({ email, password, firstName, lastName, secretQuestion, secretAnswer});
        res.status(200).json({ status: true, message: `Account ${email} successfully registered!`});
    } else 
        {
            return res.status(200).json({status: false, errorName: 'dupEmail', message: 'Email already in use'})
        }

}


module.exports = 
{
    getAllAccounts,
    changePassword,
    forgotPassword,
    addAccounts,
    logIn
};