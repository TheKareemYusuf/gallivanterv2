const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    time_spent: { type: Number },
    attempts: { type: Number },
    authentication: { type: String },
    errors: { type: Number },
    success: { type: Boolean },
    mobile: { type: Boolean },
    input: { type: [String] },
    channel: { type: String },
    history: [{
        type: { type: String },
        message: { type: String },
        time: { type: Number }
    }]
});

const customerSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true },
    customer_code: { type: String },
    phone: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed },
    risk_action: { type: String }
});

const authorizationSchema = new mongoose.Schema({
    authorization_code: { type: String, required: true },
    bin: { type: String, required: true },
    last4: { type: String, required: true },
    exp_month: { type: String, required: true },
    exp_year: { type: String, required: true },
    card_type: { type: String, required: true },
    bank: { type: String, required: true },
    country_code: { type: String, required: true },
    brand: { type: String, required: true },
    account_name: { type: String, required: true }
});

const paymentSchema = new mongoose.Schema({
    event: { type: String, required: true },
    data: {
        id: { type: Number, required: true },
        domain: { type: String, required: true },
        status: { type: String, required: true },
        reference: { type: String, required: true },
        amount: { type: Number, required: true },
        message: { type: String },
        gateway_response: { type: String, required: true },
        paid_at: { type: Date, required: true },
        created_at: { type: Date, required: true },
        channel: { type: String, required: true },
        currency: { type: String, required: true },
        ip_address: { type: String, required: true },
        metadata: { type: mongoose.Schema.Types.Mixed },
        log: logSchema,
        fees: { type: mongoose.Schema.Types.Mixed },
        customer: customerSchema,
        authorization: authorizationSchema,
        plan: { type: mongoose.Schema.Types.Mixed }
    }
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;