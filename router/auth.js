const express = require('express')
const router = express.Router();
const bcrypt = require('bcrypt');
const sgMail = require('@sendgrid/mail')

require('../db/conn')
const User = require('../model/userSchema');
const authenticate = require('../middleware/authenticate');

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

router.get('/', (req, res) => {
    res.send('hello')
})

router.get('/login', (req, res) => {
    res.send('logged in')
})

router.post('/signup', async (req, res) => {
    const { name, email, phone, work, password, cpassword } = req.body;

    if (!name || !email || !phone || !work || !password || !cpassword) {
        return res.status(422).json({ message: `Please Fill all the fields!`, status: 422 })
    }
    try {

        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(422).json({ message: `Email already exists!`, status: 422 })
        } else if (password !== cpassword) {
            return res.status(422).json({ message: `Password did not match!`, status: 422 })
        } else {
            const newUser = new User({ name, email, phone, work, password, cpassword })
            await newUser.save();
            // Send mail through sendgrid

            const msg = {
                to: email, // Change to your recipient
                from: {
                    name: "Sharkk.com",
                    email: "mail@sharkk.studio" 
                }, // Change to your verified sender
                subject: 'Registration Successsful',
                text: 'Dear Customer, You have been successfully registered! Thank You for using our service.',
                html: `
                            <!DOCTYPE html>
                                <body>
                                    <section>
                                        <p>Dear Customer,<br/> You have been successfully registered! <br/> Thank You for using our service.</p>
                                    </section>
                                </body>
                            </html>
                      `
            }
            await sgMail.send(msg);
            res.status(201).json({ message: `User Registered Successfully!`, status: 201 })
        }
    } catch (error) {
        console.log(error)
    }
})

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: `Please fill all the fields!` })
    }
    try {

        const existingUser = await User.findOne({email});
        if (!existingUser) {
            return res.status(404).json({ message: `User Not Registered!` })
        } else {
            const isMatch = await bcrypt.compare(password, existingUser.password);
            const token = await existingUser.generateAuthToken();

            if (isMatch === true) {
                res.cookie('JWT', token, {
                    expires: new Date(Date.now() + 2592000000),
                    httpOnly: true
                })
                res.status(200).json({ message: `Login Successful!` });
            } else {
                res.status(404).json({ message: `Invalid Credentials!` });
            }
        }
    } catch (error) {
        console.log(error);
    }
})

router.get('/about', authenticate, (req, res) => {
    res.send(req.rootUser);
})

router.get('/getData', authenticate, (req, res) => {
    res.send(req.rootUser);
})

router.post('/contact', authenticate, async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        if (!name || !email || !phone || !message) { return res.status(400).json({message: "Please fill the fields correctly!"}) }

        const userContact = await User.findOne({ _id: req.userID })

        if (userContact) {
            const userMessage = await userContact.addNewMessage(name, email, phone, message)
            // await userContact.save();

            res.status(201).json({ message: "Message Sent!" })

        }

    } catch (error) {
        res.status(400).send({ message: "There was an unexpected error. Please try again later!" })
    }
})

router.get('/logout', (req, res) => {
    res.clearCookie('JWT', { path: "/" })
    res.status(200).send({ message: 'User logged out!' })
})


// router.get('/check', async (req, res)=> {
//     const userContact = await User.findOne({ _id: "639c211f2e239eaa336a62f8" })
//     res.send(userContact)
// })

module.exports = router;
