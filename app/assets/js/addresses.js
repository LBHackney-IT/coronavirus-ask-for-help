var SELECT_ADDRESS_LABEL =
  '<label class="govuk-label lbh-label" for="address-select">Select address</label>';
var SELECT_ADDRESS_SELECT_START =
  '<select class="govuk-select  lbh-select" id="address-select" name="address-select"><option>Select address</option>';

function Addresses() {
  this.addresses = [];
  this.addressFinderButton = document.getElementById("address-finder");
  this.API_KEY = null;
  this.API_URL = null;
  this.postcode = document.getElementById("lookup_postcode");
  this.buildingNumber = document.getElementById("building_number");
  this.allowManualEntry = false;
}

Addresses.prototype.init = function() {
  if (this.addressFinderButton) {
    this.API_KEY = this.addressFinderButton.getAttribute("data-api-key");
    this.API_URL = this.addressFinderButton.getAttribute("data-api-url");
    this.addressFinderButton.addEventListener(
      "click",
      this.lookupAddress.bind(this)
    );
  }
};

Addresses.prototype.showManualAddressForm = function(e) {
  e.preventDefault();
  document.getElementById("address-lookup-fieldset").style.display = "none";
  document.getElementById("address-manual-fieldset").style.display = "block";
};

Addresses.prototype.lookupAddress = function() {
  var postcode = this.postcode.value;
  var buildingNumber = this.buildingNumber.value;
  this.addresses = [];
  this.getAddressData(postcode, buildingNumber, 1);
};

Addresses.prototype.getAddressData = function(postcode, buildingNumber, page) {
  var xhttp = new XMLHttpRequest();
  var that = this;
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      that.postcode.parentElement.classList.remove(
        "govuk-form-group--error",
        "lbh-form-group--error"
      );
      that.postcode.classList.remove("govuk-input--error");
      if (document.getElementById("lookup-email-error")) {
        document.getElementById("lookup-email-error").remove();
      }
      var rawData = JSON.parse(xhttp.response);
      var data = rawData.data;
      var totalCount = data.total_count;
      that.addresses = that.addresses.concat(data.address);
      if (totalCount > that.addresses.length) {
        that.getAddressData(postcode, buildingNumber, page + 1);
      } else {
        that.processAddresses();
      }
    } else if (this.readyState == 4 && this.status - 400 >= 0) {
      if (!that.postcode.classList.contains("govuk-input--error")) {
        var formGroup = that.postcode.parentElement;
        formGroup.classList.add(
          "govuk-form-group--error",
          "lbh-form-group--error"
        );
        that.postcode.classList.add("govuk-input--error");
        var errorMessage = document.createElement("span");
        errorMessage.setAttribute("id", "lookup-email-error");
        errorMessage.classList.add("govuk-error-message");
        errorMessage.innerHTML =
          '<span class="govuk-visually-hidden">Error:</span> Enter a valid postcode';
        formGroup.insertBefore(errorMessage, that.postcode);
      }
    }
  };
  xhttp.onerror = function() {};
  var queryString = "?page=" + page + "&buildingnumber=" + buildingNumber;
  if (postcode.length > 0) {
    queryString += "&postcode=" + postcode;
  } else {
    queryString += "&gazetteer=local";
  }

  queryString +="&format=detailed";


  xhttp.open("GET", this.API_URL + queryString, true);
  xhttp.setRequestHeader("x-api-key", this.API_KEY);
  xhttp.send();
};

Addresses.prototype.processAddresses = function() {
  if (this.addresses.length > 0) {
    var innerHTML = SELECT_ADDRESS_LABEL + SELECT_ADDRESS_SELECT_START;
    for (var i = 0; i < this.addresses.length; i++) {
      innerHTML +=
        '<option value="' +
        i +
        '" data-line-1="' +
        this.addresses[i].line1 +
        '" data-line-2="' +
        this.addresses[i].line2 +
        '" data-line-3="' +
        this.addresses[i].line3 +
        '" data-postcode="' +
        this.addresses[i].postcode +
        '" data-uprn="' +
        this.addresses[i].uprn +
        '" data-gazetteer="' +
        this.addresses[i].gazetteer +
        '" data-ward="' +
        this.addresses[i].ward +
        '">' +
        this.addresses[i].line1 +
        ", " +
        this.addresses[i].line2 +
        ", " +
        this.addresses[i].postcode +
        "</option>";
    }

    if (this.allowManualEntry) {
      innerHTML +=
        '</select><p class="lbh-body-m">Or <a href="" class="lbh-link" id="manual-address-button">enter address manually</a>';
    };
    
    var select = document.getElementById("address-div");
    if (select == null) {
      select = document.createElement("div");
      select.classList.add("govuk-form-group", "lbh-form-group");
      select.setAttribute("id", "address-div");
    }
    select.innerHTML = innerHTML;
    this.addressFinderButton.parentElement.insertBefore(
      select,
      this.addressFinderButton.nextElementSibling
    );
    document
      .getElementById("address-select")
      .addEventListener("change", this.populateChosenAddress.bind(this));
  } else {
    var html = '<p class="lbh-body-m">No addresses found, please check your details and try again</p>';

    if (this.allowManualEntry) {
      html =
        '<p class="lbh-body-m">No addresses found, please check your details and try again or <a href="" class="lbh-link" id="manual-address-button">enter address manually</a></p>';
    }

    var select = document.getElementById("address-div");

    if (select == null) {
      select = document.createElement("div");
      select.classList.add("govuk-form-group", "lbh-form-group");
      select.setAttribute("id", "address-div");
    }

    select.innerHTML = html;
    this.addressFinderButton.parentElement.insertBefore(
      select,
      this.addressFinderButton.nextElementSibling
    );
  }

  if (this.allowManualEntry) {
    document
      .getElementById("manual-address-button")
      .addEventListener("click", this.showManualAddressForm.bind(this));
  }
};

Addresses.prototype.populateChosenAddress = function(e) {
  var select = document.getElementById("address-select");
  var selectedOption = select.options[select.selectedIndex];
  document.getElementById(
    "address_first_line"
  ).value = selectedOption.getAttribute("data-line-1");
  document.getElementById(
    "address_second_line"
  ).value = selectedOption.getAttribute("data-line-2");
  document.getElementById(
    "address_third_line"
  ).value = selectedOption.getAttribute("data-line-3");
  document.getElementById("postcode").value = selectedOption.getAttribute(
    "data-postcode"
  );
  document.getElementById("uprn").value = selectedOption.getAttribute(
    "data-uprn"
  );
  document.getElementById("ward").value = selectedOption.getAttribute(
    "data-ward"
  );
  document.getElementById("gazetteer").value = selectedOption.getAttribute(
    "data-gazetteer"
  );
};

export default Addresses;
