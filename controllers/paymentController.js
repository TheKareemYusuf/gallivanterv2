const axios = require('axios');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/appError');
const CONFIG = require('../config/config');

const verifyPayment = async (req, res, next) => {
    try {

        const { reference } = req.body;

        const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${CONFIG.PAYSTACK_SECRET_KEY}`,
            },
        });

        const { status, data } = response;

        if (status === 200 && data.status === 'success') {
            res.json({ message: 'Payment verified successfully' });
        } else {
            res.status(400).json({ message: 'Payment verification failed' });
        }

    } catch (error) {
        next(error);
    }
};

const paymentWebhook = async (req, res, next) => {
    try {
        const secret = CONFIG.PAYSTACK_SECRET_KEY;

        // Validate the event
        const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
        if (hash !== req.headers['x-paystack-signature']) {
            return res.status(400).send('Invalid signature');
        }

        const event = req.body;

        // Handle the event
        if (event.event === 'charge.success') {
            const paymentData = event.data;
            console.log('Payment successful:', paymentData);

            // You can save the payment data to your database here

            res.status(200).send('Webhook received');
        } else {
            res.status(400).send('Event type not handled');
        }

    } catch (error) {
        next(error);
    }
};

module.exports = {
    verifyPayment,
    paymentWebhook,
};