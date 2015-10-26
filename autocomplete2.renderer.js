// handsontable/src/renderers/autocompleteRenderer.js 참고
(function (Handsontable, Handlebars) {
  "use strict";


  // Autocomplete2Renderer Start
  var clonableWRAPPER = document.createElement('DIV');
  clonableWRAPPER.className = 'htAutocompleteWrapper';

  var clonableARROW = document.createElement('DIV');
  clonableARROW.className = 'htAutocompleteArrow';
// workaround for https://github.com/handsontable/handsontable/issues/1946
// this is faster than innerHTML. See: https://github.com/handsontable/handsontable/wiki/JavaScript-&-DOM-performance-tips
  clonableARROW.appendChild(document.createTextNode(String.fromCharCode(9660)));

  var wrapTdContentWithWrapper = function(TD, WRAPPER) {
    WRAPPER.innerHTML = TD.innerHTML;
    empty(TD);
    TD.appendChild(WRAPPER);
  };

  function Autocomplete2Renderer(instance, TD, row, col, prop, value, cellProperties) {
    var WRAPPER = clonableWRAPPER.cloneNode(true); //this is faster than createElement
    var ARROW = clonableARROW.cloneNode(true); //this is faster than createElement

    Handsontable.renderers.TextRenderer.apply(this, arguments);

    var labelTemplate = cellProperties.labelTemplate,
        dataField     = cellProperties.dataField,
        source        = cellProperties.source;
    var template      = Handlebars.compile(labelTemplate);
    var rowObj        = instance.getData()[row];
    //list
    var list;
    if (Array.isArray(source)) {
      list = source;
    } else if (typeof source == 'function') {
      source(value, rowObj,
        function(choices) {
          list = choices;
        }
      );
    }
    var whwereObj = {};whwereObj[dataField] = value;

    var findObj   = _.findWhere(list, whwereObj);
    if (findObj) TD.innerHTML = template(findObj);

    TD.appendChild(ARROW);
    Handsontable.Dom.addClass(TD, 'htAutocomplete');

    if (!TD.firstChild) { //http://jsperf.com/empty-node-if-needed
      //otherwise empty fields appear borderless in demo/renderers.html (IE)
      TD.appendChild(document.createTextNode(String.fromCharCode(160))); // workaround for https://github.com/handsontable/handsontable/issues/1946
      //this is faster than innerHTML. See: https://github.com/handsontable/handsontable/wiki/JavaScript-&-DOM-performance-tips
    }

    if (!instance.acArrowListener) {
      var eventManager = Handsontable.eventManager(this);

      //not very elegant but easy and fast
      instance.acArrowListener = function(event) {
        if (Handsontable.Dom.hasClass(event.target, 'htAutocompleteArrow')) {
          instance.view.wt.getSetting('onCellDblClick', null, new WalkontableCellCoords(row, col), TD);
        }
      };

      eventManager.addEventListener(instance.rootElement, 'mousedown', instance.acArrowListener);

      //We need to unbind the listener after the table has been destroyed
      instance.addHookOnce('afterDestroy', function() {
        eventManager.destroy();
      });
    }
  }

  Handsontable.renderers.Autocomplete2Renderer = Autocomplete2Renderer;
  Handsontable.renderers.registerRenderer('autocomplete2', Autocomplete2Renderer);


})(Handsontable, Handlebars);
