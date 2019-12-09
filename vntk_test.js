var vntk = require('vntk');
var fs = require('fs');

var str = "";

var promise = new Promise((resolve, reject) => {
	fs.readFile('test.txt', 'utf8', (err, data) => {
		var tokenizer = vntk.wordTokenizer();
		if (err) throw err;	
		str = data;		
		resolve(tokenizer.tag(data));		
	});
});

promise.then((tokens) => {
	var tf = new vntk.TfIdf();
	tf.addDocument(str);
	console.log('tokenized');
	var arr = [], lastItem = '', sum = 0;
	tokens.sort();
	tokens.forEach((item, i) => {
		if (item == lastItem || hasSpecialChar(item)) return;
		tf.tfidfs(item, (j, measure) => {
			if (measure <= 0) return;
			sum += measure;
			arr.push({word: item, point: measure, index: i});
		})
		lastItem = item;
	})
	toTxt(arr, 'out0');
	arr = reduce(arr, 10);
	arr.sort((a, b) => {
		return a.index - b.index;
	})
	toTxt(arr, 'out');
})

function hasSpecialChar(str)
{
	var pattern = new RegExp(/[().’“”~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/)
	return pattern.test(str);
}

function reduce(arr, lim)
{
	arr.sort((a, b) => {
		return b.point - a.point;
	})
	var arr2 = [];
	for (let i = 0; i < lim; i++)
		arr2.push(arr[i]);
	return arr2;
}

function toTxt(tokens, fileName)
{
	var str = '';
	tokens.forEach((item) => {str += item.word + ' '});
	str += '\n';
	tokens.forEach((item) => {str += 'word: ' + item.word + '\npoint: ' + item.point + '\n'});
	fs.writeFile(`${fileName}.txt`, str, (err, data) => {
		if (err) throw err;		
		console.log(`saved in ${fileName}.txt`);
	});
}

function jsonify(tokens, fileName)
{
	var jsonData = JSON.stringify(tokens);	
	fs.writeFile(`${fileName}.json`, jsonData, (err, data) => {
		if (err) throw err;		
		console.log(`saved in ${fileName}.json`);
	});
}