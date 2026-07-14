class apiresponse {
    constructor(statuscode , data , message = "Success"){
        this.success = true;
        this.statuscode = statuscode;
        this.message = message;
        this.data = data;
    }
}


module.exports = apiresponse;