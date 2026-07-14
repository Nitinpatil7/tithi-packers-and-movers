class apierror extends Error{
    constructor(statuscode, message = "Soemthing Went Wrong" , errors =[]){
        super(message);

        this.statuscode = statuscode;
        this.errors = errors;
        this.success = false;
        this.message = message;

        Error.captureStackTrace(this , this.constructor);
    }
}

module.exports = apierror;