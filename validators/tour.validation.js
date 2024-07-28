const Joi = require("joi");
const AppError = require("../utils/appError");


const coverageSchema = Joi.object({
  meals: Joi.boolean(),
  accommodation: Joi.boolean(),
  transportation: Joi.boolean(),
  pickUp: Joi.boolean(),
  insurance: Joi.boolean()
});

const locationSchema = Joi.object({
  country: Joi.string(),
  address: Joi.string()
});

const detailsSchema = Joi.object({
  included: Joi.string(), // Expecting HTML formatted string
  notIncluded: Joi.string(), // Expecting HTML formatted string
  highlights: Joi.string() // Expecting HTML formatted string
});

const daySchema = Joi.object({
  dayNumber: Joi.number(),
  description: Joi.string(),
  imageUrl: Joi.string(),
  imagePublicId: Joi.string()
});

const itinerarySchema = Joi.object({
  numberOfDays: Joi.number(),
  days: Joi.array().items(daySchema)
});

// This ensures  that numberOfDays is equal to the number of items in the days array of the itinerary schema
// const itinerarySchema = Joi.object({
//     numberOfDays: Joi.number().required(),
//     days: Joi.array().items(daySchema).required()
//   }).custom((value, helpers) => {
//     if (value.numberOfDays !== value.days.length) {
//       return helpers.message('numberOfDays must be equal to the number of items in the days array');
//     }
//     return value;
//   });

const requirementsSchema = Joi.object({
  language: Joi.string(),
  departurePoint: Joi.string(),
  transportationMethod: Joi.string().valid('airplane', 'road', 'rail', 'water'),
  mealsProvided: Joi.object({
    breakfast: Joi.boolean(),
    lunch: Joi.boolean(),
    dinner: Joi.boolean()
  })
});

const pricingSchema = Joi.object({
  price: Joi.number(),
  currency: Joi.string().default("NGN"),
  partialPricing: Joi.boolean(),
  upfrontPercentage: Joi.number().when('partialPricing', { is: true, then: Joi.required() }),
  cancellationPolicy: Joi.string()
});

const gallerySchema = Joi.array().items(
    Joi.object({
      imageUrl: Joi.string(),
      imagePublicId: Joi.string()
    })
  ).max(4);

const TourSchema = Joi.object({
  tourType: Joi.string().valid('custom', 'guided').required(),
  tourTitle: Joi.string().required(),
  tourDescription: Joi.string().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  arrivalTime: Joi.string().required(),
  departureTime: Joi.string().required(),
  tourCategory: Joi.array().items(Joi.string()).required(),
  minTraveler: Joi.number().required(),
  maxTraveler: Joi.number().required(),
  tourCoverage: coverageSchema.required(),
  searchKeywords: Joi.array().items(Joi.string()).max(5),
  location: locationSchema,
  details: detailsSchema,
  itinerary: itinerarySchema,
  requirements: requirementsSchema,
  pricing: pricingSchema,
  gallery: gallerySchema,
  agreedToTerms: Joi.boolean().default(false),
  operatorId: Joi.string(),
  operatorName: Joi.string(),
  companyName: Joi.string(),

});

async function TourValidationMW(req, res, next) {
  const tourPayload = req.body;

  try {
    await TourSchema.validateAsync(tourPayload);
    next();
  } catch (error) {
    if (error.isJoi) {
      return next(new AppError(`${error.details[0].path} is invalid`, 400));
    } else {
      next(error);
    }
  }
}



module.exports = TourValidationMW;