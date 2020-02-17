function respondError(err, res, code = 500) {
    res.status(code);
    if (typeof err != "string") { // internal error
        console.log(err);
        res.send({ err: "Internal Server error" });
        return;
    } else {
        res.send({ err: err });
    }
}

function respondSuccess(obj = undefined, res, code = 200) {
    res.status(code);
    if (obj === undefined) {
        res.send();
    } else {
        res.send(obj);
    }
}


function isNumber(num) {
    return !isNaN(parseFloat(num)) && !isNaN(num);
}

function isSpecified(value) {
    return value !== undefined && value !== null;
}

module.exports = {
    respondError: respondError,
    respondSuccess: respondSuccess,
    isNumber: isNumber,
    isSpecified: isSpecified
}