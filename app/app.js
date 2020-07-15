const express = require("express");
const app = express();
const nunjucks = require("nunjucks");
const path = require("path");
const axios = require("axios");
const querystring = require("querystring");
const bodyParser = require("body-parser");
const { check, validationResult } = require("express-validator");
const NotifyClient = require("notifications-node-client").NotifyClient;

const errorFieldHelper = require('../helpers/fieldErrors');

const dotenv = require("dotenv");
dotenv.config();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

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

  // Define port to run server on
const port = process.env.PORT || 9000;

// Configure Nunjucks
// const _templates = process.env.NODE_PATH
//   ? process.env.NODE_PATH + "/templates"
//   : "templates";
const _templates = [
  "",
  "node_modules/lbh-frontend/lbh/",
  "node_modules/lbh-frontend/lbh/components/",
  "node_modules/govuk-frontend/govuk/",
  "node_modules/govuk-frontend/govuk/components/"
];

nunjucks.configure(_templates, {
  autoescape: true,
  cache: false,
  express: app
}).addGlobal('GA_UA', process.env.GA_UA);

// Set Nunjucks as rendering engine for pages with .html suffix
app.engine("html", nunjucks.render);
app.set("view engine", "html");

app.use("/public", express.static("public"));

app.use("/assets", express.static("node_modules/lbh-frontend/lbh/assets"));
app.use("/assets", express.static("node_modules/govuk-frontend/govuk/assets"));


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
        "/step-1?" +
          querystring.stringify(extractedErrors) +
          "&" +
          querystring.stringify(req.body)
      );
    } else {
      const query = req.body;

      if (query.is_on_behalf === 'false') {
        res.locals.addresses_api_url = process.env.ADDRESSES_API_URL;
        res.locals.addresses_api_key = process.env.ADDRESSES_API_KEY;

        res.render("templates/step-2.html");

      } else {
        res.render("templates/step-1-1.html");
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
        res.render("templates/complete.html", {endJourney: true, messageID: '1-1'});
      } else {
        res.render("templates/step-1-2.html");
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

      res.render("templates/step-1-3.html");
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

      res.render("templates/step-1-4.html");
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
      res.locals.addresses_api_url = process.env.ADDRESSES_API_URL;
      res.locals.addresses_api_key = process.env.ADDRESSES_API_KEY;

      res.render("templates/step-2.html");
    }
  }
);

app.post(
  "/step-2",
  [
    check("postcode", "Enter a real postcode, like E8 1EA.")
        .trim()
        .escape()
        .notEmpty(),
    check("postcode", "Enter a real postcode, like E8 1EA.")
        .if(check("postcode").notEmpty())
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
          res.render("templates/complete.html", {endJourney: true, messageID: '2'});

        } else {
          res.render("templates/step-3.html");
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
        res.render("templates/step-3-1.html");
      } else if (query.what_coronavirus_help.includes('accessing essential supplies')) {
        res.render("templates/step-3-4.html");
      } else {
        res.render("templates/step-4.html");
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
        res.render("templates/step-3-2.html");
      } else if (query.what_coronavirus_help.includes('accessing essential supplies')) {
        res.render("templates/step-3-4.html");
      } else {
        res.render("templates/step-4.html");
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
        res.render("templates/step-3-3.html");
      } else if (query.what_coronavirus_help === 'accessing essential supplies') {
        res.render("templates/step-3-4.html");
      } else {
        res.render("templates/step-4.html");
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
        res.render("templates/step-3-4.html");
      } else {
        res.render("templates/step-4.html");
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
      res.render("templates/step-4.html")
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
      res.render("templates/step-5.html")
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
      res.render("templates/step-6.html")
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
      res.render("templates/step-7.html")
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
      res.render("templates/step-8.html")
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
      res.render("templates/step-9.html")
    }
  }
);

app.post(
  "/step-9",
  [
    check("number_of_children_under_18", "Enter the number of children under 18 in your household.")
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
      res.render("templates/step-10.html")
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
      res.render("templates/complete.html")
    }
  }
);

app.get("/:page", function(req, res) {
    res.locals.query = req.query;
    res.render("templates/" + req.params.page);
  });
  
  app.get("/", function(req, res) {
    res.render("templates/step-1.html");
  });
  
  // Start server
  app.listen(port);
  console.log("Listening on port %s...", port);