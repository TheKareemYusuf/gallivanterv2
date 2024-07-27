function generateBookingCode() {
    // Helper function to generate a random digit (0-9)
    function getRandomDigit() {
        return Math.floor(Math.random() * 10);
    }

    // Helper function to generate a random uppercase letter (A-Z)
    function getRandomLetter() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        return letters[Math.floor(Math.random() * letters.length)];
    }

    // Generate the first part (3 digits)
    const part1 = `${getRandomDigit()}${getRandomDigit()}${getRandomDigit()}`;

    // Generate the second part (2 digits)
    const part2 = `${getRandomDigit()}${getRandomDigit()}`;

    // Generate the third part (3 letters)
    const part3 = `${getRandomLetter()}${getRandomLetter()}${getRandomLetter()}`;

    // Combine the parts with dashes
    const bookingCode = `${part1}-${part2}-${part3}`;

    return bookingCode;
}

module.exports = generateBookingCode;


