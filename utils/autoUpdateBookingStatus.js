const cron = require('node-cron');
const Booking = require('../models/bookingModel'); 
const AppError = require('../utils/appError');
const Tour = require('../models/tourModel'); 

// Schedule a job to run every day at midnight
cron.schedule('0 0 * * *', async () => {
    try {
        const currentDate = new Date();

        // Update bookings that are completed
        await Booking.updateMany(
            { endDate: { $lt: currentDate }, status: 'upcoming' },
            { status: 'completed' }
        );

      // Update bookings that are upcoming
      await Booking.updateMany({
        startDate: { $lte: currentDate },
        endDate: { $gte: currentDate },
            status: { $ne: 'upcoming' }
        }, { $set: { status: 'upcoming' } });

          // Update tours that are completed
          await Tour.updateMany(
            { endDate: { $lt: currentDate }, stage: 'upcoming' },
            { stage: 'completed' }
        );

      // Update tours that are upcoming
      await Tour.updateMany({
        startDate: { $lte: currentDate },
        endDate: { $gte: currentDate },
        stage: { $ne: 'upcoming' }
        }, { $set: { stage: 'upcoming' } });


        console.log('Booking statuses updated successfully.');
    } catch (error) {
        console.error('Error updating booking statuses:', error);
    }
});