"use strict"

var fs = require('fs');
var http = require('http');
var url = require('url');
var formi = require('formidable');
var loadFile = require('./loadFile.js');
var tess = require ('./tesseract_engine.js');
var vntk = require('./vntk_engine.js');
	
console.log('Starting');

function addContent(content, id, str) {
	var i = str.indexOf(`id="${id}`), lim = str.length
	while (str[i] != '>' && i < lim) i++;
	return str.slice(0, i + 1) + content + str.slice(i + 1, lim);
}

loadFile.load('./test.html').then((val) => {
	var server = http.createServer((req, res) => {	
		console.log(req.url);
		if (req.url == '/') {
			res.writeHead(200, {"Content-Type": "text/html"});
			res.end(val);
		}
		else if  (req.url == '/fileupload') {
			var form = new formi.IncomingForm();
			form.parse(req, (err, fields, files) => {
				console.log(`Path: ${files.filetoupload.path}\nName: ${files.filetoupload.name}\nType: ${files.filetoupload.type}\n`);
				tess.load(files.filetoupload.path).then((file) => {
					loadFile.load(`./${file}`).then((content) => {
						var result = addContent(content, "OCR", val);
						result = addContent(vntk.extractKW(content), "keyword", result);
						res.writeHead(200, {"Content-Type": "text/html"});
						res.end(result);
					})
				})
			})
		}
		else {
			const url = req.url.slice(1);
			loadFile.load(`./${url}`).then((content) => {
				res.writeHead(200, {"Content-Type": "text/css"});
				console.log(`Sended ${url}`);
				res.end(content);
			})
		}
	})

	server.listen(8080, () => {
		console.log('Server created at port 8080');
	});
})