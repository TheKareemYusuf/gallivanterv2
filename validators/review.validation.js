const Joi = require("joi");
const AppError = require("../utils/appError");

const reviewSchema = Joi.object({
    // firstName: Joi.string().required(),
    // userAvatar: Joi.string().optional(), // URL to user's avatar image
    // tourTitle: Joi.string().required(),
    // tourId: Joi.string().required(),
    // date: Joi.date().default(Date.now),
    rating: Joi.number().required().min(1).max(5),
    valueForMoneyRating: Joi.number().min(1).max(5).optional(),
    reviewText: Joi.string().max(1000).optional(),
    isAnonymous: Joi.boolean().default(false),
});

async function ReviewValidationMW(req, res, next) {
    const reviewPayload = req.body;

    try {
        await reviewSchema.validateAsync(reviewPayload);
        next();
    } catch (error) {
        if (error.isJoi) {
            return next(new AppError(`${error.details[0].path} is invalid`, 400));
        } else {
            next(error);
        }
    }
}

module.exports = ReviewValidationMW;