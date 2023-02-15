const jwt = require('jsonwebtoken')
const User = require('../model/userSchema')

const authenticate = async (req, res, next) => {
    try {
        const token = req.cookies.JWT;
        const verifyToken = jwt.verify(token, process.env.SECRET_KEY);
        const rootUser = await User.findOne({ id: verifyToken.id, "tokens.token": token });
        if (!rootUser) { throw new Error('User not found!') }

        req.token = token;
        req.rootUser = rootUser;
        req.userID = rootUser.id;
        next();

    } catch (error) {
        res.status(401).send({ message: "Unauthorized" })
        // console.log(error);
    }
}

module.exports = authenticate;