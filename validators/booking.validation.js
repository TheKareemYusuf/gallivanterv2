const Joi = require("joi");

const contactDetailsSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    phoneNumber: Joi.string().required(),
});

const activityDetailsSchema = Joi.object({
    firstName: Joi.string(),
    lastName: Joi.string(),
    dateOfBirth: Joi.date(),
    specialRequirements: Joi.string(),
});

const bookingSchema = Joi.object({
    status: Joi.string().valid('upcoming', 'completed', 'cancelled').required(),
    userId: Joi.string().required(),
    userFullName: Joi.string().required(),
    numberOfParticipants: Joi.number().required(),
    tourCategory: Joi.array().items(Joi.string()).required(),
    tourTitle: Joi.string().required(),
    operatorId: Joi.string().required(),
    companyName: Joi.string().required(),
    tourType: Joi.string().valid('custom', 'guided').required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    tourId: Joi.string().required(),
    price: Joi.number().required(),
    hasPaid: Joi.boolean().default(false),
    bookingCode: Joi.string().required(),
    paymentReference: Joi.string().required(),
    contactDetails: contactDetailsSchema.required(),
    activityDetails: Joi.array().items(activityDetailsSchema).optional(),
});


async function BookingValidationMW(req, res, next) {
    const bookingPayLoad = req.body;
  
    try {
      const isNew = req.method === 'POST';
      await bookingSchema.validateAsync(bookingPayLoad, { context: { isNew } });
      next();
    } catch (error) {
      // Check if it's a Joi validation error
      if (error.isJoi) {
        // Extract the error message and send it as a response
        // return res.status(400).json({ error: `${error.details[0].path} is invalid` });
        return next(new AppError(`${error.details[0].path} is invalid`, 400))
      } else {
        // If it's not a Joi validation error, pass it to the next middleware for general error handling
        next(error);
      }
    }
  }

module.exports = BookingValidationMW;