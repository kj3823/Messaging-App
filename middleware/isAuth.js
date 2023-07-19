const jwt = require('jsonwebtoken');

const SECRET_FOR_SIGNING = 'THIS IS A PRIVATE KEY WHICH IS USED FOR SIGNING';
module.exports = (req, res, next) => {
    const extractedHeader = req.get('Authorization');
    if (!extractedHeader) {
        console.log(extractedHeader);
        const error = new Error('Not Authenticated');
        error.statusCode = 401;
        throw error;
    }
    const token = extractedHeader.split(' ')[1] //used for getting headers, (front ent Bearer token_value), so we only get the token value
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, SECRET_FOR_SIGNING) //decodes and verifies
    } catch (err) {
        err.statusCode = 500;
        throw err;
    }
    if (!decodedToken) //token not verifired, but decoding worked.
    {
        const error = new Error('Not Authenticated!');
        error.statusCode = 401;
        throw error;
    }
    req.userID = decodedToken.id //stored as userId in token, storing for use in requests
    next();
}