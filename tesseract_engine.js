const childProc = require('child_process');

var dest = 'D:\\Dev\\Javascript\\vntk\\output';

var load = (src) => {
	var promise = new Promise((resolve, reject) => {
		var cmd = `tesseract ${src} ${dest}`;
		childProc.exec(cmd, (err, stdout, stderr) => {
			if (err) return console.log(err);
			console.log(`stdout ${stdout}`);
			console.log(`stderr ${stderr}`);
			resolve('output.txt');
		});
	});
	return promise;
}

module.exports = {
	load: load,
}