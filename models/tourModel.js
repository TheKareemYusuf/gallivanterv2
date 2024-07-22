// const { string } = require("joi");

const mongoose = require('mongoose');

const coverageSchema = new mongoose.Schema({
    meals: { type: Boolean },
    accommodation: { type: Boolean },
    transportation: { type: Boolean },
    pickUp: { type: Boolean },
    insurance: { type: Boolean }
});

const locationSchema = new mongoose.Schema({
    country: { type: String },
    address: { type: String }
});

const detailsSchema = new mongoose.Schema({
    included: { type: String }, // Expecting HTML formatted string
    notIncluded: { type: String }, // Expecting HTML formatted string
    highlights: { type: String } // Expecting HTML formatted string
});

const daySchema = new mongoose.Schema({
    dayNumber: { type: Number },
    description: { type: String },
    imageUrl: String,
    imagePublicId: String
});

const itinerarySchema = new mongoose.Schema({
    numberOfDays: { type: Number },
    days: { type: [daySchema] }
});

const requirementsSchema = new mongoose.Schema({
    language: { type: String },
    departurePoint: { type: String },
    transportationMethod: { type: String, enum: ['airplane', 'road', 'rail', 'water'] },
    mealsProvided: {
        breakfast: { type: Boolean },
        lunch: { type: Boolean },
        dinner: { type: Boolean }
    }
});

const pricingSchema = new mongoose.Schema({
    price: {
        type: Number,
    },
    currency: {
        type: String,
        default: "NGN"
    },
    partialPricing: { type: Boolean },
    upfrontPercentage: { type: Number, required: function () { return this.partialPricing; } },
    cancellationPolicy: { type: String, }
});

const gallerySchema = new mongoose.Schema({
    imagesUrl: {
        type: [String],
        validate: [arrayLimit, '{PATH} exceeds the limit of 4']
    },
    imagesPublicId: {
        type: [String],
        validate: [arrayLimit, '{PATH} exceeds the limit of 4']
    }
});

function arrayLimit(val) {
    return val.length <= 4;
}

const TourSchema = new mongoose.Schema({
    tourType: { type: String, enum: ['custom', 'guided'], required: true },
    tourTitle: { type: String, required: true, unique: true },
    tourDescription: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    arrivalTime: { type: String, required: true },
    departureTime: { type: String, required: true },
    tourCategory: { type: [String], required: true },
    minTraveler: { type: Number, required: true },
    maxTraveler: { type: Number, required: true },
    tourCoverage: { type: coverageSchema, required: true },
    searchKeywords: { type: [String], validate: [arrayLimit, '{PATH} exceeds the limit of 5'] },
    location: { type: locationSchema },
    details: { type: detailsSchema },
    itinerary: { type: itinerarySchema },
    requirements: { type: requirementsSchema },
    pricing: { type: pricingSchema },
    gallery: { type: gallerySchema },
    agreedToTerms: { type: Boolean, default: false },
    operatorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        // get the creator from creatorSchema
        ref: "Operator",
    },
    operatorName: {
        type: String,
        // get the creator from creatorSchema
        ref: "Operator",
    },
    companyName: {
        type: String,
        // get the creator from creatorSchema
        ref: "Operator",
    },
});




// const ItinerarySchema = new mongoose.Schema({
//     day: {
//         type: Number,
//         required: true
//     },
//     title: {
//         type: String,
//         required: true
//     },
//     description: {
//         type: String,
//         required: true
//     },
//     image: {
//         type: String,
//         required: true
//     }
// });

// const ImageSchema = new mongoose.Schema({
//     url: String,
//     publicId: String
// });

// const TourSchema = new mongoose.Schema(
//     {
//         title: {
//             type: String,
//             required: [true, "Title is compulsory"],
//             unique: [true, "There's a tour with this name already"],
//             trim: true,
//         },
//         description: {
//             type: String,
//             required: true,
//         },
//         tourType: {
//             type: String,
//             required: true,
//             enum: ["custom-tour", "guided-tour"]
//         },
//         startDate: {
//             type: Date,
//             required: true,
//         },
//         endDate: {
//             type: Date,
//             required: true,
//         },
//         arrivalTime: {

//         },
//         departureTime: {

//         },
//         tourCategory: {
//             type: String,
//             required: true,
//         },
//         minTraveler: {
//             type: Number,
//             required: true,
//             min: 1,
//         },
//         maxTraveler: {
//             type: Number,
//             required: true,
//             min: 1,
//         },
//         tourCoverage: {
//             type: String,
//             enum: ["meals", "accommodation", "transportation", "pick-up", "insurance"]
//         },
//         searchKeywords: {
//             type: [],

//         },
//         operatorId: {
//             type: mongoose.Schema.Types.ObjectId,
//             required: true,
//             // get the creator from creatorSchema
//             ref: "Creator",
//         },
//         operatorName: {
//             type: String,
//             // get the creator from creatorSchema
//             ref: "Creator",
//         },
//         companyName: {
//             type: String,
//             // get the creator from creatorSchema
//             ref: "Creator",
//         },
//         location: {
//             type: String,
//             required: true,
//         },
//         numOfDays: {
//             type: Number,
//             required: true,
//         },
//         price: {
//             type: Number,
//             required: true,
//         },
//         currency: {
//             type: String,
//             required: true,
//         },
//         maxCapacity: {
//             type: Number,
//             required: true,
//         },
//         regMembers: {
//             type: [
//                 {
//                     type: mongoose.Schema.Types.ObjectId,
//                 },
//             ],
//             default: [],
//             validate: {
//                 validator: function (arr) {
//                     return arr.length <= this.maxCapacity; // accessing maxCapacity from the schema
//                 },
//                 message: "Number of registered members cannot exceed the maximum capacity"
//             },

//         },
//         wishList: {
//             type: [
//                 {
//                     type: mongoose.Schema.Types.ObjectId,
//                 },
//             ],
//             default: [],

//         },
//         numOfWishList: {
//             type: Number,
//             default: 0,
//         },
//         numOfRegMembers: {
//             type: Number,
//             default: 0,
//         },
//         tags: [String],
//         itinerary: [ItinerarySchema],
//         tourCoverImageUrl: String,
//         tourCoverImagePublicId: String,
//         tourImagesData: [ImageSchema],
//         state: {
//             type: String,
//             default: "draft",
//             enum: ["draft", "published"],
//         },

//     },
//     { timestamps: true }
// );



const Tour = mongoose.model("Tour", TourSchema);

module.exports = Tour;
