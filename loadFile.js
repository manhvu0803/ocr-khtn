var fs = require('fs');

var load = (file) => {
	var promise = new Promise((resolve, reject) => {
		fs.readFile(file, 'utf8', (err, data) => {
			if (err) console.log(`${file} not found`);
			console.log(`Loaded ${file}`);
			resolve(data);
		});
	});
	return promise;
}

module.exports = {
	load: load,
};