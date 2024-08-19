import ApiResponse from "../utils/ApiResponse.js";

const ErrorHandler = (err, req, res, next) => {
    const response = new ApiResponse(
        err.status || 500,
        null,
        err.message || 'An unexpected error occurred'
    );

    res.status(response.statusCode).json(response);
};

export default ErrorHandler;
