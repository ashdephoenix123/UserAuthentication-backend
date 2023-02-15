const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const saltRounds = 10;

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    work: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    cpassword: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    messages: [
        {
            name: {
                type: String,
                required: true
            },
            email: {
                type: String,
                required: true
            },
            phone: {
                type: Number,
                required: true
            },
            message: {
                type: String,
                required: true
            }
        }
    ],
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ]
})

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, saltRounds);
        this.cpassword = await bcrypt.hash(this.cpassword, saltRounds);
    }
    next();
})

userSchema.methods.generateAuthToken = async function () {
    try {
        let token = jwt.sign({ id: this.id }, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({ token: token })
        await this.save()
        return token;
    } catch (err) {
        console.log(err);   
    }
}

// addMessage
userSchema.methods.addNewMessage = async function(name, email, phone, message){
    try{
            this.messages = await this.messages.concat({name, email, phone, message})
            await this.save();
            return this.messages;

    } catch(err){
        console.log(err)
    }
}

const User = mongoose.model('User', userSchema)

module.exports = User;

//this keyword can only be used in normal function andd not fat arrow functions
//while using middlewares use next()

