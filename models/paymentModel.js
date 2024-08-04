const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    time_spent: { type: Number, default: null },
    attempts: { type: Number, default: null },
    authentication: { type: String, default: null },
    errors: { type: Number, default: null },
    success: { type: Boolean, default: null },
    mobile: { type: Boolean, default: null },
    input: { type: [String], default: null },
    channel: { type: String, default: null },
    history: [{
        type: { type: String, default: null },
        message: { type: String, default: null },
        time: { type: Number, default: null }
    }]
});

const customerSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    first_name: { type: String, default: null },
    last_name: { type: String, default: null },
    email: { type: String, default: null },
    customer_code: { type: String, default: null },
    phone: { type: String, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: null },
    risk_action: { type: String, default: null }
});

const authorizationSchema = new mongoose.Schema({
    authorization_code: { type: String, default: null },
    bin: { type: String, default: null },
    last4: { type: String, default: null },
    exp_month: { type: String, default: null },
    exp_year: { type: String, default: null },
    card_type: { type: String, default: null },
    bank: { type: String, default: null },
    country_code: { type: String, default: null },
    brand: { type: String, default: null },
    account_name: { type: String, default: null }
});

const paymentSchema = new mongoose.Schema({
    event: { type: String, required: true },
    data: {
        id: { type: Number, required: true },
        domain: { type: String, default: null },
        status: { type: String, default: null },
        reference: { type: String, default: null },
        amount: { type: Number, default: null },
        message: { type: String, default: null },
        gateway_response: { type: String, required: true },
        paid_at: { type: Date, default: null },
        created_at: { type: Date, default: null },
        channel: { type: String, default: null },
        currency: { type: String, default: null },
        ip_address: { type: String, default: null },
        metadata: { type: mongoose.Schema.Types.Mixed, default: null },
        log: logSchema,
        fees: { type: mongoose.Schema.Types.Mixed, default: null },
        customer: customerSchema,
        authorization: authorizationSchema,
        plan: { type: mongoose.Schema.Types.Mixed, default: null }
    }
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;