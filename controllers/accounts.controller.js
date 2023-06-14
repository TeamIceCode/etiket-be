let accountsMongo = require('../models/accounts.mongo');
let recordsMongo = require('../models/records.mongo');

function getAllAccounts (req, res) 
{
    accountsMongo.find({}).then(async (accounts) => {
        await res.status(200).json(accounts);
    });

}

function logIn(req, res)
{
    const { email, password } = req.body; //inputs from postman
    //const vars to hold msgs
    const INVALID_INPUT = 'Invalid credentials! Check email and password.';
    const LOGIN_SUCCESS_MSG = () => `Welcome ${email}! you have successfully logged in !`; 
    
     //find the username that matches from postman input
    accountsMongo.find({email: email, password: password}).then(async (accounts)=> {

        if (accounts.length) 
        {
                res.status(200).json({
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

    });

    
}

function changePassword(req, res)
{
    const { email, password, newPassword, confirmPassword } = req.body; //inputs from postman
    //const vars to hold msgs
    const INVALID_INFO = 'Check if Email and current password are correct, New password must not match with current password.';
    const PASSWORDS_NOT_MATCH = 'New password must match with confirm password.';
    const PASSWORD_UPDATED_MSG = email => `User:${email}'s password has been updated`; 

    //find the email that matches from postman input
    accountsMongo.find({email: email, password: password}).then(accounts => {
        const validNewPassword = (newPassword === confirmPassword);
        if (accounts.length && validNewPassword && newPassword !== password) 
        {
            // account.password = newPassword;
            accountsMongo.updateOne(
                {email: email},
                { password: `${newPassword}`},
            ).exec();
                res.status(200).json({
                status: true,
                message: (PASSWORD_UPDATED_MSG(email))
            })
        }
        else{
            return !newPassword || !confirmPassword || !validNewPassword ? res.send(PASSWORDS_NOT_MATCH) : res.send(INVALID_INFO);
        }

    });
}

function forgotPassword(req, res)
{
    const { email, secretAnswer, newPassword, confirmPassword } = req.body; //inputs from postman
    //const vars to hold msgs
    const INVALID_INFO = 'Unsuccessful! Please check you answer and email';
    const PASSWORDS_NOT_MATCH = 'New password must match with confirm password.';
    const PASSWORD_UPDATED_MSG = email => `User:${email}'s password has been updated`; 
    const answer = secretAnswer.toLowerCase();


    accountsMongo.find({email: email, secretAnswer: answer}).then(accounts => {
        const validNewPassword = (newPassword === confirmPassword);
        if (accounts.length && validNewPassword) 
        {
            // account.password = newPassword;
            accountsMongo.updateOne(
                {email: email},
                { password: `${newPassword}`},
            ).exec();
                res.status(200).json({
                status: true,
                message: (PASSWORD_UPDATED_MSG(email))
            })
        }
        else{
            return !newPassword || !confirmPassword || !validNewPassword ? res.send(PASSWORDS_NOT_MATCH) : res.send(INVALID_INFO);
        }

    });


}


function addAccounts(req, res) 
{
    const { email, password, firstName, lastName, confirmPassword, secretQuestion, secretAnswer, reservation } = req.body;

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
    if (firstName.match(/^[a-zA-Z]*$/) === null) {
        return res.status(200).json({ status: false, errorName: 'invalidFirstName', 
        message: 'First name must not contain numbers or special characters' 
    });
    }
    if (lastName.match(/^[a-zA-Z]*$/) === null) {
        return res.status(200).json({ status: false, errorName: 'invalidLastName', 
        message: 'Last name must not contain numbers' 
    });
    }
    if (email.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z]+)*$/) === null) {
        return res.status(200).json({ status: false, errorName: 'invalidFormat', 
        message: 'Invalid Email Format' 
    });
    }
    if (password.length >= 1 && password.length <= 7) {
        return res.status (200).json({ status: false, errorName: 'weakPassword',
            message: 'Weak Password! Password must be atleast 8 characters.'
        })
    }
    if (password !== confirmPassword) {
        return res.status(200).json({ status: false, errorName: 'confirmPassword', 
            message: 'Passwords do not match' 
        });
    }

    //Check email if it already exists in database
    accountsMongo.find({email: email}).then(async (account) => {
        if (!account.length) {
            await accountsMongo.create({ email, password, firstName, lastName, secretQuestion, secretAnswer, reservation });
            res.status(200).json({ status: true, message: `Account ${email} successfully registered!`});
        } else {
            return res.status(200).json({status: false, errorName: 'dupEmail', message: 'Email already in use'});
        }
    })
}


module.exports = 
{
    getAllAccounts,
    changePassword,
    forgotPassword,
    addAccounts,
    logIn
};