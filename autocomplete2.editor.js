
// handsontable/src/editors/autocompleteEditor.js 참고
// select2-editer.js 참고
(function (Handsontable, Handlebars) {
  "use strict";

  // Autocomplete2Editor Start
  var Autocomplete2Editor = Handsontable.editors.HandsontableEditor.prototype.extend();


  Autocomplete2Editor.prototype.init = function () {
    Handsontable.editors.HandsontableEditor.prototype.init.apply(this, arguments);

    this.selectedItem = null;
    this.query = null;
    this.choices = [];
  };

  Autocomplete2Editor.prototype.createElements = function() {
    Handsontable.editors.HandsontableEditor.prototype.createElements.apply(this, arguments);

    Handsontable.Dom.addClass(this.htContainer, 'autocompleteEditor');
    Handsontable.Dom.addClass(this.htContainer, window.navigator.platform.indexOf('Mac') === -1 ? '' : 'htMacScroll');
  };

  var skipOne = false;
  function onBeforeKeyDown(event) {
    skipOne = false;
    var editor = this.getActiveEditor();
    var KEY_CODES = Handsontable.helper.KEY_CODES;
    if (Handsontable.helper.isPrintableChar(event.keyCode) || event.keyCode === KEY_CODES.BACKSPACE ||
      event.keyCode === KEY_CODES.DELETE || event.keyCode === KEY_CODES.INSERT) {
      var timeOffset = 0;

      // on ctl+c / cmd+c don't update suggestion list
      if (event.keyCode === KEY_CODES.C && (event.ctrlKey || event.metaKey)) {
        return;
      }
      if (!editor.isOpened()) {
        timeOffset += 10;
      }

      if (editor.htEditor) {
        editor.instance._registerTimeout(setTimeout(function() {
          editor.queryChoices(editor.TEXTAREA.value);
          skipOne = true;
        }, timeOffset));
      }
    }
  }

  Autocomplete2Editor.prototype.prepare = function() {
    this.instance.addHook('beforeKeyDown', onBeforeKeyDown);
    Handsontable.editors.HandsontableEditor.prototype.prepare.apply(this, arguments);
  };
  Autocomplete2Editor.prototype.open = function() {
    Handsontable.editors.HandsontableEditor.prototype.open.apply(this, arguments);
    var choicesListHot = this.htEditor.getInstance();
    var that = this;
    var trimDropdown = this.cellProperties.trimDropdown === void 0 ? true : this.cellProperties.trimDropdown;
    this.TEXTAREA.style.visibility = 'visible';
    this.focus();
    choicesListHot.updateSettings({
      'colWidths': trimDropdown ? [Handsontable.Dom.outerWidth(this.TEXTAREA) - 2] : void 0,
      width: trimDropdown ? Handsontable.Dom.outerWidth(this.TEXTAREA) + Handsontable.Dom.getScrollbarWidth() + 2 : void 0,
      afterRenderer: function(TD, row, col, prop, value) {
        var caseSensitive = this.getCellMeta(row, col).filteringCaseSensitive === true,
          indexOfMatch,
          match,
          value = Handsontable.helper.stringify(value);
        if (value) {
          indexOfMatch = caseSensitive ? value.indexOf(this.query) : value.toLowerCase().indexOf(that.query.toLowerCase());
          if (indexOfMatch != -1) {
            match = value.substr(indexOfMatch, that.query.length);
            TD.innerHTML = value.replace(match, '<strong>' + match + '</strong>');
          }
        }
      },
      modifyColWidth: function(width, col) {
        return trimDropdown ? width : width + 15;
      }
    });
    this.htEditor.view.wt.wtTable.holder.parentNode.style['padding-right'] = Handsontable.Dom.getScrollbarWidth() + 2 + 'px';
    if (skipOne) {
      skipOne = false;
    }
    that.instance._registerTimeout(setTimeout(function() {
      that.queryChoices(that.TEXTAREA.value);
    }, 0));
  };
  Autocomplete2Editor.prototype.close = function() {
    Handsontable.editors.HandsontableEditor.prototype.close.apply(this, arguments);
  };
  Autocomplete2Editor.prototype.queryChoices = function(query) {
    query = query.toString();
    this.query = query;
    if (typeof this.cellProperties.source == 'function') {
      var that = this,
          rowObj = this.instance.getData()[this.row];
      this.cellProperties.source(query, rowObj, function(choices) {
        that.updateChoicesList(choices);
      });
    } else if (Array.isArray(this.cellProperties.source)) {
      var choices;
      if (!query || this.cellProperties.filter === false) {
        choices = this.cellProperties.source;
      } else {
        var filteringCaseSensitive = this.cellProperties.filteringCaseSensitive === true;
        var lowerCaseQuery = query.toLowerCase();
        var labelTemplate = this.cellProperties.labelTemplate; //동준수정
        //filtering
        choices = this.cellProperties.source.filter(function(choice) {
          // 동준수정 시작
          var template = Handlebars.compile(labelTemplate);
          var choiceStr = template(choice);
          // 동준수정 끝
          if (filteringCaseSensitive) {
            return choiceStr.indexOf(query) != -1;
          } else {
            return choiceStr.toLowerCase().indexOf(lowerCaseQuery) != -1;
          }
        });
      }
      this.updateChoicesList(choices);
    } else {
      this.updateChoicesList([]);
    }
  };
  Autocomplete2Editor.prototype.updateChoicesList = function(choices) {
    //console.log("updateChoicesList choices", choices);
    var pos = Handsontable.Dom.getCaretPosition(this.TEXTAREA),
        endPos = Handsontable.Dom.getSelectionEndPosition(this.TEXTAREA);
    // 동준수정 Start
    var filteringCaseSensitive = this.cellProperties.filteringCaseSensitive,
        labelTemplate = this.cellProperties.labelTemplate;
    var orderByRelevance = Autocomplete2Editor.sortByRelevance(this.getValue(), choices, filteringCaseSensitive, labelTemplate );
    //console.log("orderByRelevance", orderByRelevance);
    // 동준수정 end
    var highlightIndex;
    if (this.cellProperties.filter != false) {
      var sorted = [];
      for (var i = 0,
             choicesCount = orderByRelevance.length; i < choicesCount; i++) {
        sorted.push(choices[orderByRelevance[i]]);
      }
      highlightIndex = 0;
      choices = sorted;
    } else {
      highlightIndex = orderByRelevance[0];
    }
    this.choices = choices;
    //동준수정 Start
    // [{object},...] --> [String,...]
    var choiceStrs = _.map(choices, function(el){
      var template = Handlebars.compile(labelTemplate);
      return template(el);
    });
    this.htEditor.loadData(Handsontable.helper.pivot([choiceStrs]));
    //동준수정 end
    this.updateDropdownHeight();
    if (this.cellProperties.strict === true) {
      this.highlightBestMatchingChoice(highlightIndex);
    }
    // 한글입력시 단어입력이 안되었음..
    //this.instance.listen();
    this.TEXTAREA.focus();
    Handsontable.Dom.setCaretPosition(this.TEXTAREA, pos, (pos != endPos ? endPos : void 0));
  };
  Autocomplete2Editor.prototype.updateDropdownHeight = function() {
    var currentDropdownWidth = this.htEditor.getColWidth(0) + Handsontable.Dom.getScrollbarWidth() + 2;
    var trimDropdown = this.cellProperties.trimDropdown === void 0 ? true : this.cellProperties.trimDropdown;
    this.htEditor.updateSettings({
      height: this.getDropdownHeight(),
      width: trimDropdown ? void 0 : currentDropdownWidth
    });
    this.htEditor.view.wt.wtTable.alignOverlaysWithTrimmingContainer();
  };
  Autocomplete2Editor.prototype.finishEditing = function(restoreOriginalValue) {
    if (!restoreOriginalValue) {
      this.instance.removeHook('beforeKeyDown', onBeforeKeyDown);
    }
    Handsontable.editors.HandsontableEditor.prototype.finishEditing.apply(this, arguments);
  };
  Autocomplete2Editor.prototype.highlightBestMatchingChoice = function(index) {
    if (typeof index === "number") {
      this.htEditor.selectCell(index, 0);
    } else {
      this.htEditor.deselectCell();
    }
  };
  Autocomplete2Editor.sortByRelevance = function(value, choices, caseSensitive, labelTemplate) {
    //console.log("sortByRelevance value, choices, caseSensitive, labelTemplate", value, choices, caseSensitive, labelTemplate);
    var choicesRelevance = [],
        currentItem,
        valueLength = value.length,
        valueIndex,
        charsLeft,
        result = [],
        i,
        choicesCount;
    if (valueLength === 0) {
      for (i = 0, choicesCount = choices.length; i < choicesCount; i++) {
        result.push(i);
      }
      return result;
    }
    for (i = 0, choicesCount = choices.length; i < choicesCount; i++) {
      //동준수정 시작
      var template = Handlebars.compile(labelTemplate);
      currentItem = template(choices[i]);
      //동준수정 끝
      if (caseSensitive) {
        valueIndex = currentItem.indexOf(value);
      } else {
        valueIndex = currentItem.toLowerCase().indexOf(value.toLowerCase());
      }
      if (valueIndex == -1) {
        continue;
      }
      charsLeft = currentItem.length - valueIndex - valueLength;
      choicesRelevance.push({
        baseIndex: i,
        index: valueIndex,
        charsLeft: charsLeft,
        value: currentItem
      });
    }
    choicesRelevance.sort(function(a, b) {
      if (b.index === -1) {
        return -1;
      }
      if (a.index === -1) {
        return 1;
      }
      if (a.index < b.index) {
        return -1;
      } else if (b.index < a.index) {
        return 1;
      } else if (a.index === b.index) {
        if (a.charsLeft < b.charsLeft) {
          return -1;
        } else if (a.charsLeft > b.charsLeft) {
          return 1;
        } else {
          return 0;
        }
      }
    });
    for (i = 0, choicesCount = choicesRelevance.length; i < choicesCount; i++) {
      result.push(choicesRelevance[i].baseIndex);
    }
    return result;
  };
  Autocomplete2Editor.prototype.getDropdownHeight = function() {
    var firstRowHeight = this.htEditor.getInstance().getRowHeight(0) || 23;
    return this.choices.length >= 10 ? 10 * firstRowHeight : this.choices.length * firstRowHeight + 8;
  };
  Autocomplete2Editor.prototype.allowKeyEventPropagation = function(keyCode) {
    var selected = {row: this.htEditor.getSelectedRange() ? this.htEditor.getSelectedRange().from.row : -1};
    var allowed = false;
    var KEY_CODES = Handsontable.helper.KEY_CODES;
    if (keyCode === KEY_CODES.ARROW_DOWN && selected.row < this.htEditor.countRows() - 1) {
      allowed = true;
    }
    if (keyCode === KEY_CODES.ARROW_UP && selected.row > -1) {
      allowed = true;
    }
    return allowed;
  };
  // 동준추가 Start
  Autocomplete2Editor.prototype.setValue = function(newValue) {
    var labelTemplate = this.cellProperties.labelTemplate,
        dataField = this.cellProperties.dataField;
    var selectedItem = _.find(this.choices, function(el){
      var template = Handlebars.compile(labelTemplate);
      return (newValue == template(el));
    });
    this.TEXTAREA.value = (!selectedItem)? newValue : selectedItem[dataField];
  };
  // 동준추가 End

  Handsontable.editors.Autocomplete2Editor = Autocomplete2Editor;
  Handsontable.editors.registerEditor('autocomplete2', Autocomplete2Editor);


})(Handsontable, Handlebars);
