// build for the require() function to be exported

var debaters = require('./debater_values.json');
module.exports = function (debaters) {return debaters}