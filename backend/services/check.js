/**

## check.js ##

# Pattern Documentation:
  Patterns are JSON Objects defining a certain format of values that should be checked.
  Every key in the pattern object represents a key of the same name in the check-object.
  The check() function returns true if all given parameters are valid, false otherwise.
  
  Values can be set as required using 'required:true'. If 'null' should be allowed, 'allowNull:true' must be set.
  Data Types can be checked using the 'type' key in the pattern. Supported Types are as follows:
  
 * 'string'
   - 'minLength' : Minimum length of the string
   - 'maxLength' : Maximum length of the string
   - 'regex'     : Regular Expression the string needs to match (passed as a string)
  
 * 'boolean'

 * 'date'
   - 'min'            : Earliest possible date
   - 'max'            : Latest possible date
   - 'allowTimestamp' : Allows Numbers to be passed as timestamps

 * 'number'
   - 'min' : Minimum value
   - 'max' : Maximum value
   
 * 'integer'
   Same attributes as 'number', but does not allow decimal places.
   
   
   
# Example Patterns:

	* Check for a valid number larger than or equal to 10:
	{
		testNumber: {
			required: true,
			type: 'number',
			min: 10
		}
	}
	
	* Check for a simple Email address string:
	{
		email: {
			required: true,
			type: 'string',
			regex: '.+@.+\..+'
		}
	}

**/

const utils = require('./utils');

function check(input, res, pattern, callback = null) {
	var results = {};
	var errors = 0;
    Object.keys(pattern).forEach(key => {
		let vPattern = pattern[key];
		if(!utils.isSpecified(input[key])) {
			if(input[key] === null && vPattern.allowNull)
				return;
			if(vPattern.required) {
				results[key] = {ok:false, error:"Required attribute not specified."};
				errors++;
			}
			return;
		}
		
		let value = input[key];
        if(utils.isSpecified(vPattern.type)) {
			switch(vPattern.type) {
				case "string":
					if(typeof value !== "string") {
						results[key] = {error:"Value is not a string."};
						errors++;
						return;
					}
					if(utils.isSpecified(vPattern.minLength) && value.length < vPattern.minLength) {
						results[key] = {error:"Value is too short."};
						errors++;
						return;
					}
					if(utils.isSpecified(vPattern.maxLength) && value.length > vPattern.maxLength) {
						results[key] = {error:"Value is too long."};
						errors++;
						return;
					}
					if(utils.isSpecified(vPattern.regex) && !(new RegExp(vPattern.regex).test(value))) {
						results[key] = {error:"Value is not in the correct format."};
						errors++;
						return;
					}
					break;
				case "boolean":
					if(typeof value !== "boolean") {
						results[key] = {error:"Value is not a boolean."};
						errors++;
						return;
					}
					break;
				case "date":
					if(new Date(value).toString() === "Invalid Date") {
						results[key] = {error:"Value is not a valid date."};
						errors++;
						return;
                    }
                    if(utils.isNumber(value)) {
                        if(!utils.isSpecified(vPattern.allowTimestamp) || (utils.isSpecified(vPattern.allowTimestamp) && !vPattern.allowTimestamp)) {
                            results[key] = {error:"Value is not a valid date."};
						    errors++;
						    return;
                        }
                    }
					let date = new Date(value);
					if(utils.isSpecified(vPattern.min) && date.getTime() < vPattern.min.getTime()) {
						results[key] = {error:"Value is too low."};
						errors++;
						return;
					}
					if(utils.isSpecified(vPattern.max) && date.getTime() > vPattern.max.getTime()) {
						results[key] = {error:"Value is too high."};
						errors++;
						return;
					}
					break;
				case "number":
					if(!utils.isNumber(value)) {
						results[key] = {error:"Value is not a number."};
						errors++;
						return;
					}
					if(utils.isSpecified(vPattern.min) && value < vPattern.min) {
						results[key] = {error:"Value is too low."};
						errors++;
						return;
					}
					if(utils.isSpecified(vPattern.max) && value > vPattern.max) {
						results[key] = {error:"Value is too high."};
						errors++;
						return;
					}
					break;
				case "integer":
					if(!utils.isNumber(value) || value.toString().includes(".") || value.toString().includes(",")) {
						results[key] = {error:"Value is not an integer."};
						errors++;
						return;
					}
					if(utils.isSpecified(vPattern.min) && value < vPattern.min) {
						results[key] = {error:"Value is too low."};
						errors++;
						return;
					}
					if(utils.isSpecified(vPattern.max) && value > vPattern.max) {
						results[key] = {error:"Value is too high."};
						errors++;
						return;
					}
					break;
			}
		}
    });
	
	if(errors > 0) {
		if(callback !== null && typeof callback === "function")
			callback(results);
		else {
			res.status(400);
			res.send({err: Object.keys(results).map(r => r + " - " + results[r].error).join(" ; ")});
		}
		return false;
	}
	return true;
}

module.exports = {
    check: check
}