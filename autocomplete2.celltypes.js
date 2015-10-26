//handsontable/src/cellTypes.js 참고
(function () {
  "use strict";

  Handsontable.Autocomplete2 = {
    editor: Handsontable.editors.Autocomplete2Editor,
    renderer: Handsontable.renderers.Autocomplete2Renderer,
    //TODO: Autocomplete2 validator 미구현
    //validator: Handsontable.AutocompleteValidator,
  };

  Handsontable.cellTypes['autocomplete2'] = Handsontable.Autocomplete2;

})();
