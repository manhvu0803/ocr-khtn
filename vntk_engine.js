var vntk = require('vntk');
var loadFile = require('./loadFile.js');
var fs = require('fs');

var words;

load('./input.txt');

function extractKW(data) {
	var arr = vntk.posTag().tag(data);
	arr = unduplicate(arr.filter((val, i) => !hasSpecialChar(val[0]) && val[1] != 'CH' && val[1] != 'E' && val[1] != 'L'));
	words = tf(data, arr);
	toTxt(words, 'out0');
	while(words.length > 20) 
		words = filterKW(words);	
	toTxt(words, 'out');
	console.log(`extract ${words.length} keyword(s)`);
	return words.map((item) => item.word).join(' ');
}

function load(file) {
	var promise = new Promise((resolve, reject) => {
		loadFile.load(file).then((data) => {
			resolve(extractKW(data));
		})
	})
	return promise;
}

function filterKW(words) {
	var sum = 0;
	words.forEach((word) => { 
		if (word.tag == 'Np' && isNaN(word.word)) word.tf += 1;
		else if (word.tag == 'N') word.tf += 0.3;
		else if (word.tag == 'M')  word.tf -= 0.3;
	})
	words.forEach((item) => { sum += item.tf });
	const aver = sum / words.length;
	var fltrd = words.filter((word) => (word.tag == 'Np' && isNaN(word.word)) || word.tf >= aver);
	if (fltrd.length == words.length)
		fltrd = words.filter((word, i) => i % 2 == 0);
	console.log(`\x1b[36m%s\x1b[0m`, `tf average: ${aver}`);
	console.log(fltrd.length);
	return fltrd;
}

function reduceKW(words, limit) {
	words.sort((a, b) => {
		if (a.tag == 'Np' && isNaN(word.word)) return -1;
		return b.tf - a.tf;
	});
	var cnt = 0;
	words = words.filter((val, index) => {
		if ((val.tag == 'Np' && isNaN(word.word)) || cnt < limit) {
			cnt++;
			return true;
		}
		return false;
	})
	return words.sort((a, b) => a.index - b.index);
}

function unduplicate(a) {	
	a.sort();
	var a2 = [];
	a2.push(a[0]);	
	for (let i = 1; i < a.length - 1; i++)
		if (a[i][0] != a[i - 1][0]) a2.push(a[i]);
	return a2.sort((a, b) => a.index - b.index);;
}

function tf(str, tokens) {	
	var tf = new vntk.TfIdf();
	tf.addDocument(str.toLowerCase());
	var arr = [];
	tokens.forEach((item, i) => {
		tf.tfidfs(item[0].toLowerCase(), (j, measure) => {
			if (measure > 0) {
				arr.push({word: item[0], tag: item[1], tf: measure, index: i});
				if (item[1] == 'Np') arr[arr.length - 1].tf += 1;
				else if (item[1] == 'N') arr[arr.length - 1].tf += 0.3;
			}
		})
	})
	return arr;
}

function hasSpecialChar(str)
{
	var pattern = new RegExp(/[().’“”~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/)
	return pattern.test(str);
}

function toTxt(tokens, fileName)
{	
	var str = tokens.map((item) => item.word).join(' ') + '\n';
	str += tokens.map((item) => `word: ${item.word}\ntag: ${item.tag}\ntfidf: ${item.tf}`).join('\n');
	fs.writeFile(`${fileName}.txt`, str, (err, data) => {
		if (err) console.log(`toTxt error: ${err}`);
		console.log(`saved in ${fileName}.txt`);
	});
}

module.exports = {
	load: load,
	extractKW: extractKW,
}