var vntk = require('vntk');
var loadFile = require('./loadFile.js');
var fs = require('fs');

var words;

function extractKW(data) {
	var arr = vntk.posTag().tag(data);
	arr = unduplicate(arr.filter((val, i) => !hasSpecialChar(val[0]) && val[1] != 'CH' && val[1] != 'E' && val[1] != 'L'));
	words = tf(data, arr);
	toTxt(words, 'out0');
	while(words.length > 20) words = filterKW(words);
	console.log(`extract ${words.length} keyword(s)`);
	return words.map((item) => item.word).join(' ');	
}

function loadFile(file) {
	var promise = new Promise((resolve, reject) => {
		loadFile.load(file).then((data) => {
			resolve(extractKW);
		})
	})
	return promise;
}

function filterKW(words) {
	var sum = 0;
	words.forEach((word) => { sum += word.tf });
	var aver = sum / words.length;
	console.log(`\x1b[36m%s\x1b[0m`, `tf average: ${aver}`);
	return words.filter((word) => word.tag == 'Np' || word.tf >= aver);
}

function reduceKW(words, limit) {
	words.sort((a, b) => {
		if (a.tag == 'Np')	return -1;
		return b.tf - a.tf;
	});
	var cnt = 0;
	words = words.filter((val, index) => {
		if (val.tag == 'Np' || cnt < limit) {
			cnt++;
			return true;
		}
		return false;
	})
	return words.sort((a, b) => a.index - b.index);
}

function unduplicate(a) {	
	var a2 = [];
	a.push(a[0]);
	for (let i = 0; i < a.length - 1; i++)
		if (a[i][0] != a[i + 1][0]) a2.push(a[i]);
	return a2;
}

function tf(str, tokens) {	
	var tf = new vntk.TfIdf();
	tf.addDocument(str.toLowerCase());
	var arr = [];
	tokens.forEach((item, i) => {
		tf.tfidfs(item[0].toLowerCase(), (j, measure) => {
			if (measure > 0)
				arr.push({word: item[0], tag: item[1], tf: measure, index: i});
		})
	})
	return arr;
}

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
	var str = tokens.map((item) => item.word).join(' ') + '\n';
	str += tokens.map((item) => `word: ${item.word}\ntag: ${item.tag}\ntfidf: ${item.tf}`).join('\n');
	fs.writeFile(`${fileName}.txt`, str, (err, data) => {
		if (err) throw err;		
		console.log(`saved in ${fileName}.txt`);
	});
}

module.exports = {
	loadFile: loadFile,
	extractKW: extractKW,
}