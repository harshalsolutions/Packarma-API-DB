import CustomError from "./CustomError.js"

export const handleError = (error, next) => {
    if (error.code === 'ER_DUP_ENTRY') return next(new CustomError(409, 'Email already in use'));
    if (error.code === 'ER_BAD_FIELD_ERROR') return next(new CustomError(400, 'Invalid field in update query'));
    else next(new CustomError(500, error.message));
};