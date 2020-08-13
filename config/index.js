require('dotenv').config(); // this loads the defined variables from .env

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {
    node_env: process.env.NODE_ENV,
    host: process.env.HOST || "0.0.0.0",
    port: parseInt(process.env.PORT, 10) || 9000,
    protocol: process.env.PROTOCOL,
    local: process.env.LOCAL,
    ga_ua: process.env.GA_UA,

    resident_support_request_api_url: process.env.RESIDENT_SUPPORT_REQUESTS_API_URL,
    resident_support_request_api_key: process.env.RESIDENT_SUPPORT_REQUESTS_API_KEY,

    addresses_api_url: process.env.ADDRESSES_API_URL,
    addresses_api_key: process.env.ADDRESSES_API_KEY,

    notify_api_key: process.env.NOTIFY_API_KEY,
    email_template_id: process.env.EMAIL_TEMPLATE_ID,
    send_emails: process.env.SEND_EMAILS
}