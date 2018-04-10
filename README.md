# Handsontable-autocomplete2
Handsontable autocomplete2 CellType


source가 collection인 autocomplete이 없어서 만들었습니다.

https://github.com/trebuchetty/Handsontable-select2-editor 에서 많이 참고하였습니다.

Handsontable 0.17.0, Handlebars 4.0.3, Underscore.js 1.8.2 환경에서 작업하였습니다.


Using this custom custom CellType

```JAVASCRIPT
var mydata = [
   { codeId: 'code1', codeId2:'code1-1', num3: 3 }
  ,{ codeId: 'code1', codeId2:'code1-2', num3: 3 }
  ,{ codeId: 'code1', codeId2:'code1-1', num3: 3 }
  ,{ codeId: 'code2', codeId2:'code2-1', num3: 3 }
  ,{ codeId: 'code3', codeId2:'code3-1', num3: 3 }
  ,{ codeId: 'code1', codeId2:'code1-2', num3: 3 }
];
var codeList = [
  {code:'code1', codeNm:'codeNm1'},
  {code:'code2', codeNm:'codeNm2'},
  {code:'code3', codeNm:'codeNm3'},
  {code:'code4', codeNm:'codeNm4'},
  {code:'code5', codeNm:'codeNm5'},
];
var subCodeList = [
  {upperCode: 'code1', code:'code1-1', codeNm:'codeNm1-1'},
  {upperCode: 'code1', code:'code1-2', codeNm:'codeNm1-1'},
  {upperCode: 'code2', code:'code2-1', codeNm:'codeNm2-1'},
  {upperCode: 'code2', code:'code2-2', codeNm:'codeNm2-2'},
  {upperCode: 'code3', code:'code3-1', codeNm:'codeNm3-1'},
  {upperCode: 'code3', code:'code3-2', codeNm:'codeNm3-2'},
  {upperCode: 'code3', code:'code3-3', codeNm:'codeNm3-2'},
];

var columnsList =[
	{
		data: 'codeId',
		dataField: 'code',
		type: 'autocomplete2',
		source: codeList,
		labelTemplate: '{{code}} | {{codeNm}}',
		width: '200px',
        strict: true,
	},
	{
		data: 'codeId2',
		type: 'autocomplete2',
		source: function(value, rowObj, process){
			var result = [];
			var codeId2 = rowObj["codeId"];
			if (codeId2) {
				result = _.where(subCodeList, {upperCode:codeId2});
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
var container = document.getElementById('example_handsontable');
var hot = new Handsontable(container, {
	data: mydata,
	minSpareRows: 0,
	colHeaders: true,
	contextMenu: true,
	columns: columnsList
});
```