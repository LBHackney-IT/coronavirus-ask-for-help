require('dotenv').config(); // this loads the defined variables from .env

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {
    host: process.env.HOST || "localhost",
    port: parseInt(process.env.PORT, 10) || 5000,
    protocol: process.env.PROTOCOL,
    local: process.env.LOCAL,

    authorised_user_group: process.env.AUTHORISED_USER_GROUP,
    authorised_admin_group: process.env.AUTHORISED_ADMIN_GROUP,
    token_name: process.env.TOKEN_NAME,
    hackney_jwt_secret: process.env.HACKNEY_JWT_SECRET,
}