"use strict"

var fs = require('fs');
var http = require('http');
var url = require('url');
var formi = require('formidable');
var loadFile = require('./loadFile.js');
var tess = require ('./tesseract_engine.js');
var vntk = require('./vntk_engine.js');
	
console.log('Starting');

var server;

loadFile.load('./test.html').then((val) => {
	server = http.createServer((req, res) => {	
		console.log(req.url);
		if (req.url == '/' || req.url == '/fileupload') {
			if  (req.url == '/fileupload') {
				var form = new formi.IncomingForm();
				form.parse(req, (err, fields, files) => {
					console.log(`Path: ${files.filetoupload.path}`);
					console.log(`Type: ${files.filetoupload.type}\n`);
					tess.load(files.filetoupload.path).then((file) => {
						loadFile.load(`./${file}`).then((content) => {							
						})
					})
				});
			}
			res.writeHead(200, {"Content-Type": "text/html"})
			res.end(val);
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