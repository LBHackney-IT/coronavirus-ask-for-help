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
const dotenv = require("dotenv");

const NotifyClient = require("notifications-node-client").NotifyClient;

const errorFieldHelper = require('../helpers/fieldErrors');
const config = require('../config');

dotenv.config();


if (!config.local) {
  function requireHTTPS(req, res, next) {
    // The 'x-forwarded-proto' check is for Heroku
    if (
      !req.secure &&
      req.get("x-forwarded-proto") != "https" &&
      config.node_env != "development"
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
const port = config.port || 9000;

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
}).addGlobal('GA_UA', config.ga_ua)
  .addGlobal('addresses_api_url', config.addresses_api_url)
  .addGlobal('addresses_api_key',  config.addresses_api_key)


// Set Nunjucks as rendering engine for pages with .njk suffix
app.engine( 'njk', nunjucks.render ) ;
app.set( 'view engine', 'html' ) ;

app.use("/public", express.static("public"));

app.use("/assets", express.static("node_modules/lbh-frontend/lbh/assets"));
app.use("/assets", express.static("node_modules/govuk-frontend/govuk/assets"));


app.get("/", function(req, res) {
  return res.render("index.njk");
});

app.get("/:page", function(req, res) {
  res.locals.query = req.query;

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

      const currentSupport = Array.isArray(query.current_support) ? query.current_support.join() : query.current_support;

      const data = JSON.stringify({
        IsOnBehalf: query.is_on_behalf && true || false,

        ConsentToCompleteOnBehalf: query.consent_to_complete_on_behalf && true || false,

        OnBehalfFirstName: query.is_on_behalf && query.on_behalf_first_name || "",
        OnBehalfLastName: query.is_on_behalf && query.on_behalf_last_name || "",

        OnBehalfEmailAddress: query.is_on_behalf && query.on_behalf_email_address || "",
        OnBehalfContactNumber: query.is_on_behalf && query.on_behalf_contact_number || "",

        RelationshipWithResident: query.is_on_behalf && query.relationship_with_resident || "",

        AddressFirstLine: query.address_first_line || "",
        AddressSecondLine: query.address_second_line || "",
        AddressThirdLine: query.address_third_line || "",
        PostCode: query.postcode,
        Uprn: query.uprn || "",
        Ward: query.ward || "",

        GettingInTouchReason: query.getting_in_touch_reason || '',
        HelpWithAccessingFood: query.what_coronavirus_help.includes('accessing food') && true || false,
        HelpWithAccessingMedicine: false,
        HelpWithAccessingOtherEssentials: false,
        HelpWithDebtAndMoney: query.what_coronavirus_help.includes('debt and money') && true || false,
        HelpWithHealth: query.what_coronavirus_help.includes('health') && true || false,
        HelpWithMentalHealth: query.what_coronavirus_help.includes('mental health') && true || false,
        HelpWithHousing: query.what_coronavirus_help.includes('housing') && true || false,
        HelpWithJobsOrTraining: false,
        HelpWithChildrenAndSchools: false,
        HelpWithDisabilities: false,  
        HelpWithAccessingInternet: query.what_coronavirus_help.includes('technology support') && true || false,
        HelpWithSomethingElse: query.what_coronavirus_help.includes('something else') && true || false,

        MedicineDeliveryHelpNeeded: query.medicine_delivery_help_needed && true || false,

        IsPharmacistAbleToDeliver: query.is_pharmacist_able_to_deliver && query.is_pharmacist_able_to_deliver === "yes" && true || false,

        WhenIsMedicinesDelivered: query.when_is_medicines_delivered || "",
        NameAddressPharmacist: query.name_address_pharmacist || "",

        UrgentEssentials: query.urgent_essentials || "",
        UrgentEssentialsAnythingElse: query.urgent_essentials_anything_else || "",

        CurrentSupport: currentSupport || '',
        CurrentSupportFeedback: query.current_support_feedback || '',

        FirstName: query.first_name || "",
        LastName: query.last_name || "",

        DobDay : query.dob_day || "",
        DobMonth : query.dob_month || "",
        DobYear : query.dob_year || "",

        ContactTelephoneNumber: query.contact_telephone_number || "",
        ContactMobileNumber: query.contact_mobile_number || "",
        EmailAddress: query.email || "",

        GpSurgeryDetails: query.gp_surgery_details || "",

        NumberOfChildrenUnder18: query.number_of_children_under_18 || '',

        ConsentToShare: query.consent_to_share && true || false,

        DateTimeRecorded: new Date()
    });

    var headers = {
        "Content-Type": "application/json",
        "Content-Length": data.length,
        "x-api-key": config.resident_support_request_api_key
    };

    axios
      .post(config.resident_support_request_api_url, data, {
          headers: headers
      })
      .then(httpsRes => {
        console.log(`statusCode: ${httpsRes.statusCode}`);

        const notifyEmailAddress = query.on_behalf_email_address || query.email || "";

        console.log("EMAIL;", notifyEmailAddress);

        if (config.send_emails === "true" && notifyEmailAddress.length) {
          const notifyClient = new NotifyClient(config.notify_api_key);

          notifyClient
              .sendEmail(
              config.email_template_id,
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
          "step-10?error=We're sorry but something has gone wrong, please try again&" +
              querystring.stringify(query)
          );
      });
    }
  }
);


  

  // Start server
  app.listen(port);
  console.log("Listening on port %s...", port);