

/**
 * @description Creates a set of error fields with error messages for views
 * @returns Array
 */
const mapFieldErrors = (errors) => {
    let extractedErrors = {};

    errors
        .array()
        .map(err => (extractedErrors["error_" + err.param] = err.msg));
           
    return extractedErrors;
};

module.exports = {
    mapFieldErrors
};