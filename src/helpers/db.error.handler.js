var getUniqueErrorMessage = function (err) {
    try {
        var fieldName = err.message.substring(err.message.lastIndexOf('.$') + 2, err.message.lastIndexOf('_1'));
        return fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + ' already exists';
    }
    catch (exception) {
        return 'Unique field already exists';
    }
};
module.exports.getErrorMessage = function (err) {
    var message = '';
    if (err.code) {
        switch (err.code) {
            case 11000:
            case 11001:
                message = getUniqueErrorMessage(err);
                break;
            default:
                message = err.message;
        }
    }
    else {
        message = err.message;
    }
    return message;
};
