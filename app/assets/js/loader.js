
function Loader() {
    this.body = document.getElementsByClassName("govuk-template");
    this.loaderOverlay = document.getElementById("loader_overlay");
    this.ctaBtns = document.getElementsByClassName("js-cta-btn");
};

Loader.prototype.init = function() {
    const that = this;

    if (this.loaderOverlay) {
        Array.from(this.ctaBtns).forEach(function(element) {
            element.addEventListener('click', that.enable.bind(that));
          });
    }
};

Loader.prototype.enable = function() {
    this.body[0].classList.add("is-loading");
}

export default Loader;