const express = require("express");
const app = express();
const compression = require('compression');
const helmet = require('helmet');
const nunjucks = require("nunjucks");
const path = require("path");
const axios = require("axios");
const querystring = require("querystring");
const bodyParser = require("body-parser");
const { check, validationResult } = require("express-validator");
const cookieParser = require('cookie-parser');

const NotifyClient = require("notifications-node-client").NotifyClient;

const config = require('../config');
const errorFieldHelper = require('../helpers/fieldErrors');
const {isAuthorised} = require('../middleware/auth');

const dotenv = require("dotenv");
dotenv.config();

if (!process.env.LOCAL) {
  function requireHTTPS(req, res, next) {
    // The 'x-forwarded-proto' check is for Heroku
    if (
      !req.secure &&
      req.get("x-forwarded-proto") != "https" &&
      process.env.NODE_ENV != "development"
    ) {
      return res.redirect("https://" + req.get("host") + req.url);
    }
    next();
  }

  app.use(requireHTTPS);
}

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(helmet());
app.use(compression());

  // Define port to run server on
const port = process.env.PORT || 9000;

const _templates = [
  'templates/',
  'node_modules/lbh-frontend/lbh/',
  'node_modules/lbh-frontend/lbh/components/',
  'node_modules/govuk-frontend/govuk/',
  'node_modules/govuk-frontend/govuk/components/'
];

nunjucks.configure(_templates, {
  autoescape: true,
  cache: false,
  express: app
}).addGlobal('GA_UA', process.env.GA_UA);

app.set('views', path.join(__dirname, 'templates'));

// Set Nunjucks as rendering engine for pages with .njk suffix
app.engine( 'njk', nunjucks.render ) ;
app.set( 'view engine', 'html' ) ;

app.use("/public", express.static("public"));

app.use("/assets", express.static("node_modules/lbh-frontend/lbh/assets"));
app.use("/assets", express.static("node_modules/govuk-frontend/govuk/assets"));


app.get("/", isAuthorised, function(req, res) {
  if (req.auth) {
    res.locals.isAuthorised = req.auth.isAuthorised;
    res.locals.authName = req.auth.authName;
  }

  return res.render("index.njk");
});

app.get("/:page", function(req, res) {
  res.locals.query = req.query;

  res.locals.addresses_api_url = process.env.ADDRESSES_API_URL;
  res.locals.addresses_api_key = process.env.ADDRESSES_API_KEY;

  return res.render(req.params.page + ".njk");
});

app.post(
  "/step-1",
  [
    check("is_on_behalf", "Select yes if you’re asking for help for someone else")
      .notEmpty()
  ],
  function(req, res) {
    res.locals.query = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const extractedErrors = errorFieldHelper.mapFieldErrors(errors);

      return res.redirect(
        "/index?" +
          querystring.stringify(extractedErrors) +
          "&" +
          querystring.stringify(req.body)
      );
    } else {
      const query = req.body;

      if (query.is_on_behalf === 'false') {
        res.locals.addresses_api_url = process.env.ADDRESSES_API_URL;
        res.locals.addresses_api_key = process.env.ADDRESSES_API_KEY;

        return res.render("step-2.njk");

      } else {
        return res.render("step-1-1.njk");
      }
    }
  }
);


app.post(
  "/step-1-1",
  [
    check("consent_to_complete_on_behalf", "Select yes if you have the permission of the person needing help to fill in this form.")
      .notEmpty()
  ],
  function(req, res) {
    res.locals.query = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const extractedErrors = errorFieldHelper.mapFieldErrors(errors);

      return res.redirect(
        "/step-1-1?" +
          querystring.stringify(extractedErrors) +
          "&" +
          querystring.stringify(req.body)
      );
    } else {
      const query = req.body;

      if (query.consent_to_complete_on_behalf === 'false') {
        res.render("complete.njk", {endJourney: true, messageID: '1-1'});
      } else {
        res.render("step-1-2.njk");
      }
    }
  }
);


app.post(
  "/step-1-2",
  [
    
  ],
  function(req, res) {
    res.locals.query = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const extractedErrors = errorFieldHelper.mapFieldErrors(errors);

      return res.redirect(
        "/step-1-2?" +
          querystring.stringify(extractedErrors) +
          "&" +
          querystring.stringify(req.body)
      );
    } else {

      res.render("step-1-3.njk");
    }
  }
);


app.post(
  "/step-1-3",
  [
    
  ],
  function(req, res) {
    res.locals.query = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const extractedErrors = errorFieldHelper.mapFieldErrors(errors);

      return res.redirect(
        "/step-1-3?" +
          querystring.stringify(extractedErrors) +
          "&" +
          querystring.stringify(req.body)
      );
    } else {

      res.render("step-1-4.njk");
    }
  }
);


app.post(
  "/step-1-4",
  [
    check("relationship_with_resident", "Enter details of your relationship to the person you’re requesting help for.")
      .notEmpty()
  ],
  function(req, res) {
    res.locals.query = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const extractedErrors = errorFieldHelper.mapFieldErrors(errors);

      return res.redirect(
        "/step-1-4?" +
          querystring.stringify(extractedErrors) +
          "&" +
          querystring.stringify(req.body)
      );
    } else {
      

      res.render("step-2.njk");
    }
  }
);

app.post(
  "/step-2",
  [
    check("lookup_postcode", "Enter a real postcode, like E8 1EA.")
        .trim()
        .escape()
        .notEmpty(),
    check("lookup_postcode", "Enter a real postcode, like E8 1EA.")
        .if(check("lookup_postcode").notEmpty())
        .isPostalCode("GB"),
  ],
  function(req, res) {
    res.locals.query = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const extractedErrors = errorFieldHelper.mapFieldErrors(errors);

      return res.redirect(
        "/step-2?" +
          querystring.stringify(extractedErrors) +
          "&" +
          querystring.stringify(req.body)
      );
    } else {
        const query = req.body;

        if (query.gazetteer != 'LOCAL') {
          res.render("complete.njk", {endJourney: true, messageID: '2'});

        } else {
          res.render("step-3.njk");
        }
    }
  }
);


app.post(
  "/step-3",
  [
    check("what_coronavirus_help", "Select what you need help with.")
      .notEmpty()
  ],
  function(req, res) {
    res.locals.query = req.body;

    const errors = validationResult(req);
    res.locals.validationErrors = errors.array();

    if (!errors.isEmpty()) {
      const extractedErrors = errorFieldHelper.mapFieldErrors(errors);

      return res.redirect(
        "/step-3?" +
          querystring.stringify(extractedErrors) +
          "&" +
          querystring.stringify(req.body)
      );

    } else {
      const query = req.body;

      if (query.what_coronavirus_help.includes('accessing medicines')) {
        res.render("step-3-1.njk");
      } else if (query.what_coronavirus_help.includes('accessing essential supplies')) {
        res.render("step-3-4.njk");
      } else {
        res.render("step-4.njk");
      }
    }
  }
);


app.post(
  "/step-3-1",
  [
    check("medicine_delivery_help_needed", "Select yes if you need help with getting medicines delivered. (If nothing selected)")
      .notEmpty()
  ],
  function(req, res) {
    res.locals.query = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const extractedErrors = errorFieldHelper.mapFieldErrors(errors);

      return res.redirect(
        "/step-3-1?" +
          querystring.stringify(extractedErrors) +
          "&" +
          querystring.stringify(req.body)
      );
    } else {
      const query = req.body;

      if (query.medicine_delivery_help_needed === 'yes') {
        res.render("step-3-2.njk");
      } else if (query.what_coronavirus_help.includes('accessing essential supplies')) {
        res.render("step-3-4.njk");
      } else {
        res.render("step-4.njk");
      }
    }
  }
);


app.post(
  "/step-3-2",
  [
    check("is_pharmacist_able_to_deliver", "Select yes if your pharmacy can deliver medicines for free.")
      .notEmpty()
  ],
  function(req, res) {
    res.locals.query = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const extractedErrors = errorFieldHelper.mapFieldErrors(errors);

      return res.redirect(
        "/step-3-2?" +
          querystring.stringify(extractedErrors) +
          "&" +
          querystring.stringify(req.body)
      );
    } else {
      const query = req.body;

      if (query.is_pharmacist_able_to_deliver != 'yes') {
        res.render("step-3-3.njk");
      } else if (query.what_coronavirus_help === 'accessing essential supplies') {
        res.render("step-3-4.njk");
      } else {
        res.render("step-4.njk");
      }
    }
  }
);


app.post(
  "/step-3-3",
  [
    check("when_is_medicines_delivered", "Select when you need medicines to be delivered.")
      .notEmpty(),
    check("name_address_pharmacist", "Enter the pharmacy name for medicine collections.")
      .notEmpty()
  ],
  function(req, res) {
    res.locals.query = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const extractedErrors = errorFieldHelper.mapFieldErrors(errors);

      return res.redirect(
        "/step-3-3?" +
          querystring.stringify(extractedErrors) +
          "&" +
          querystring.stringify(req.body)
      );
    } else {
      const query = req.body;

      if (query.what_coronavirus_help.includes('accessing essential supplies')) {
        res.render("step-3-4.njk");
      } else {
        res.render("step-4.njk");
      }
    }
  }
);


app.post(
  "/step-3-4",
  [
    check("urgent_essentials", "Select the essential supplies you need.")
      .notEmpty()
  ],
  function(req, res) {
    res.locals.query = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const extractedErrors = errorFieldHelper.mapFieldErrors(errors);

      return res.redirect(
        "/step-3-4?" +
          querystring.stringify(extractedErrors) +
          "&" +
          querystring.stringify(req.body)
      );
    } else {
      res.render("step-4.njk")
    }
  }
);


app.post(
  "/step-4",
  [
    check("current_support", "Select who is helping you at the moment.")
      .notEmpty()
  ],
  function(req, res) {
    res.locals.query = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const extractedErrors = errorFieldHelper.mapFieldErrors(errors);

      return res.redirect(
        "/step-4?" +
          querystring.stringify(extractedErrors) +
          "&" +
          querystring.stringify(req.body)
      );
    } else {
      res.render("step-5.njk")
    }
  }
);

app.post(
  "/step-5",
  [
    check("first_name", "Enter your first name.")
      .notEmpty(),
    check("last_name", "Enter your last name.")
      .notEmpty()
  ],
  function(req, res) {
    res.locals.query = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const extractedErrors = errorFieldHelper.mapFieldErrors(errors);

      return res.redirect(
        "/step-5?" +
          querystring.stringify(extractedErrors) +
          "&" +
          querystring.stringify(req.body)
      );
    } else {
      res.render("step-6.njk")
    }
  }
);

app.post(
  "/step-6",
  [
    check("dob_day", "Enter a day of birth")
    .trim()
    .escape()
    .notEmpty(),
  check("dob_month", "Enter a month of birth")
    .trim()
    .escape()
    .notEmpty(),
  check("dob_year", "Enter a year of birth")
    .trim()
    .escape()
    .notEmpty(),
  ],
  function(req, res) {
    res.locals.query = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const extractedErrors = errorFieldHelper.mapFieldErrors(errors);

      return res.redirect(
        "/step-6?" +
          querystring.stringify(extractedErrors) +
          "&" +
          querystring.stringify(req.body)
      );
    } else {
      res.render("step-7.njk")
    }
  }
);


app.post(
  "/step-7",
  [
    check("contact_telephone_number", "Enter a telephone number, like 01632 960 001, 07700 900 982 or +44 0808 157 0192.")
    .trim()
    .escape()
    .notEmpty(),
  ],
  function(req, res) {
    res.locals.query = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const extractedErrors = errorFieldHelper.mapFieldErrors(errors);

      return res.redirect(
        "/step-7?" +
          querystring.stringify(extractedErrors) +
          "&" +
          querystring.stringify(req.body)
      );
    } else {
      res.render("step-8.njk")
    }
  }
);


app.post(
  "/step-8",
  [
    
  ],
  function(req, res) {
    res.locals.query = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const extractedErrors = errorFieldHelper.mapFieldErrors(errors);

      return res.redirect(
        "/step-8?" +
          querystring.stringify(extractedErrors) +
          "&" +
          querystring.stringify(req.body)
      );
    } else {
      res.render("step-9.njk")
    }
  }
);

app.post(
  "/step-9",
  [
    check("number_of_children_under_18", "Select the number of children under 18 in your household.")
      .trim()
      .escape()
      .notEmpty()    
  ],
  function(req, res) {
    res.locals.query = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const extractedErrors = errorFieldHelper.mapFieldErrors(errors);

      return res.redirect(
        "/step-9?" +
          querystring.stringify(extractedErrors) +
          "&" +
          querystring.stringify(req.body)
      );
    } else {
      res.render("step-10.njk")
    }
  }
);

app.post(
  "/step-10",
  [
    check("consent_to_share", "Select yes if we can share the information in this form with organisations offering help.")
      .trim()
      .escape()
      .notEmpty()    
  ],
  function(req, res) {
    res.locals.query = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const extractedErrors = errorFieldHelper.mapFieldErrors(errors);

      return res.redirect(
        "/step-10?" +
          querystring.stringify(extractedErrors) +
          "&" +
          querystring.stringify(req.body)
      );
    } else {
      const query = req.body;

      return res.render("complete.njk");
      
      const data = JSON.stringify({
        is_on_behalf: query.is_on_behalf && true || false,

        consent_to_complete_on_behalf: query.consent_to_complete_on_behalf,

        on_behalf_first_name: query.is_on_behalf && query.on_behalf_first_name || "",
        on_behalf_last_name: query.is_on_behalf && query.on_behalf_last_name || "",

        on_behalf_email_address: query.is_on_behalf && query.on_behalf_email_address || "",
        on_behalf_contact_number: query.is_on_behalf && query.on_behalf_contact_number || "",

        relationship_with_resident: query.is_on_behalf && query.relationship_with_resident || "",

        address_first_line: query.address_first_line || "",
        address_second_line: query.address_second_line || "",
        address_third_line: query.address_third_line || "",
        postcode: query.postcode,
        uprn: query.uprn || "",
        ward: query.ward || "",

        getting_in_touch_reason: query.getting_in_touch_reason || '',
        help_with_accessing_food: query.what_coronavirus_help.includes('') && true || false,
        help_with_accessing_medicine: query.what_coronavirus_help.includes('') && true || false,
        help_with_accessing_other_essentials: query.what_coronavirus_help.includes('') && true || false,
        help_with_debt_and_money: query.what_coronavirus_help.includes('') && true || false,
        help_with_health: query.what_coronavirus_help.includes('') && true || false,
        help_with_mental_health: query.what_coronavirus_help.includes('') && true || false,
        help_with_accessing_internet: query.what_coronavirus_help.includes('') && true || false,
        help_with_something_else: query.what_coronavirus_help.includes('') && true || false,

        // Questions 3.1 - 3-4 go here ===============
        medicine_delivery_help_needed: query.medicine_delivery_help_needed && true || false,

        is_pharmacist_able_to_deliver: query.is_pharmacist_able_to_deliver && query.is_pharmacist_able_to_deliver === "yes" && true || false,

        name_address_pharmacist: query.name_address_pharmacist || "",

        urgent_essentials: query.urgent_essentials || "",
        urgent_essentials_anything_else: query.urgent_essentials_anything_else || "",

        // Questions 3.1 - 3-4 ===================

        current_support: query.current_support || '',
        current_support_feedback: query.current_support_feedback || '',

        first_name: query.first_name || "",
        last_name: query.last_name || "",

        dob_day : query.dob_day || "",
        dob_month : query.dob_month || "",
        dob_year : query.dob_year || "",

        contact_telephone_number: query.contact_telephone_number || "",
        contact_mobile_number: query.contact_mobile_number || "",
        email_address: query.email || "",

        gp_surgery_details: query.gp_surgery_details || "",

        number_of_children_under_18: query.number_of_children_under_18 || '',

        consent_to_share: query.consent_to_share && true || false,

        date_time_recorded: new Date()
    });

    var headers = {
        "Content-Type": "application/json",
        "Content-Length": data.length,
        "x-api-key": process.env.RESIDENT_SUPPORT_REQUESTS_API_KEY
    };

    axios
      .post(process.env.RESIDENT_SUPPORT_REQUESTS_API_URL, data, {
          headers: headers
      })
      .then(httpsRes => {
        console.log(`statusCode: ${httpsRes.statusCode}`);

        const notifyEmailAddress = query.on_behalf_email_address || query.email || "";

        console.log(notifyEmailAddress);

        if (process.env.SEND_EMAILS === "true" && notifyEmailAddress.length) {
          const notifyClient = new NotifyClient(process.env.NOTIFY_API_KEY);

          notifyClient
              .sendEmail(
              process.env.EMAIL_TEMPLATE_ID,
              notifyEmailAddress,
              {
                personalisation: {
                  firstName: query.first_name || ""
                },
                reference: ""
              })
              .then(response => {
                res.render("complete.njk");
              })
              .catch(err => {
                console.error(err);
                res.render("complete.njk");
              });
        } else {
          res.render("complete.njk");
        }
      })
      .catch(error => {
          console.error(error);
          res.redirect(
          "step-10.njk?error=We're sorry but something has gone wrong, please try again&" +
              querystring.stringify(query)
          );
      });
    }
  }
);


  

  // Start server
  app.listen(port);
  console.log("Listening on port %s...", port);