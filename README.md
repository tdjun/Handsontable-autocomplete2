# Handsontable-autocomplete2
Handsontable autocomplete2 CellType


source가 collection인 autocomplete이 없어서 만들어 보왔습니다.

https://github.com/trebuchetty/Handsontable-select2-editor 에서 많이 참고하였습니다.

Handsontable 0.17.0, Handlebars 4.0.3, Underscore.js 1.8.2에서 작업하였습니다.

http://jsfiddle.net/tdjun/vmsa1z5q/ (sample)


Using this custom custom CellType

```JAVASCRIPT
var columnsList =[
    	{
        data: 'codeId',
        dataField: 'code',
        type: 'autocomplete2',
        source: codeList,
        labelTemplate: '{{code}} | {{codeNm}}',
        width: '200px'
      },
      {
        data: 'codeId2',
        type: 'autocomplete2',
        source: function(value, rowObj, process){
          var result = [];
          var codeId2 = rowObj["codeId"];
          if (codeId2) {
          result = _.where(upperCodeList, {upperCode:codeId2});
        }
        process( result );
      },
      dataField: 'code',
      labelTemplate: '{{code}} | {{codeNm}}',
      strict: false,
      width: '200px'
    },
    {data: 'num3',width: '200px',},
	];
  container = $('#example_handsontable');

  container.handsontable({
    data: mydata,
    minSpareRows: 0,
    colHeaders: true,
    contextMenu: true,
    columns: columnsList
  });
```

License

(The MIT License)

Copyright (c) 2015 Donjun Park <tdjun@naver.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
