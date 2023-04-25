// function to convert time in miliseconds
function timeToMilliseconds(time) {
    const [hours, minutes] = time.split(':').map(str => parseInt(str, 10));
    const totalMilliseconds = (hours * 60 * 60 * 1000) + (minutes * 60 * 1000);
    return totalMilliseconds;
}

// get the day if doctor is available, otherwise get the next day.
function getDayWithCode(dayCode) {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    const day = days[dayCode];
    return day;
}

// get the nextDate to allocate the next day slot
function getNextDate(dateString) {
    const currentDate = new Date(dateString);
    const nextDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);

    const year = nextDate.getFullYear();
    const month = String(nextDate.getMonth() + 1).padStart(2, '0');
    const day = String(nextDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

module.exports = { timeToMilliseconds, getDayWithCode, getNextDate };