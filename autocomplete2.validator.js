// handsontable/src/validators/autocompleteValidator.js 를 참고
(function (Handsontable) {
    "use strict";

    /**
     * Autocomplete cell validator.
     *
     * @private
     * @validator AutocompleteValidator
     * @param {*} value - Value of edited cell
     * @param {Function} callback - Callback called with validation result
     */
    function autocomplete2Validator(value, callback) {
        if (value == null) {
            value = '';
        }
        if (this.allowEmpty && value === '') {
            callback(true);
            return;
        }
        if (this.strict && this.source) {
            // 동준수정 start
            var dataField = this.dataField;
            if (typeof this.source === 'function') {
                var rowObj = this.instance.getData()[this.row];
                this.source(value, rowObj, process(value, dataField, callback));
            } else {
                process(value, dataField, callback)(this.source);
            }
            // 동준수정 end
        } else {
            callback(true);
        }
    }

    // 동준수정
    function process(value, dataField, callback) {
        var originalVal = value;

        return function (source) {
            var found = false;
            for (var s = 0, slen = source.length; s < slen; s++) {
                if (originalVal === source[s][dataField]) {
                    found = true; // perfect match
                    break;
                }
            }
            callback(found);
        };
    }

    Handsontable.Autocomplete2Validator = autocomplete2Validator;

})(Handsontable);


