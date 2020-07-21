require('dotenv').config(); // this loads the defined variables from .env

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {
    host: process.env.HOST || "localhost",
    port: parseInt(process.env.PORT, 10) || 9000,
    protocol: process.env.PROTOCOL,
    local: process.env.LOCAL,
    ga_ua: process.env.GA_UA,

    authorised_user_group: process.env.AUTHORISED_USER_GROUP,
    authorised_admin_group: process.env.AUTHORISED_ADMIN_GROUP,
    token_name: process.env.TOKEN_NAME,
    hackney_jwt_secret: process.env.HACKNEY_JWT_SECRET,

    resident_support_request_api_url: process.env.RESIDENT_SUPPORT_REQUESTS_API_URL,
    resident_support_request_api_key: process.env.RESIDENT_SUPPORT_REQUESTS_API_KEY,

    addresses_api_url: process.env.ADDRESSES_API_URL,
    addresses_api_key: process.env.ADDRESSES_API_KEY,

    notify_api_key: process.env.NOTIFY_API_KEY,
    email_template_id: process.env.EMAIL_TEMPLATE_ID,
    send_emails: process.env.SEND_EMAILS
}