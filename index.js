const express = require('express');
const app = express();
const availability = require('./availability');
const { timeToMilliseconds, getDayWithCode, getNextDate } = require('./helper');
const dotenv = require('dotenv')

dotenv.config();

app.get('/doctor-availability/:date/:time', (req, res) => {
    const clientTime = timeToMilliseconds(req.params.time);

    // Get the day
    let dayCode = new Date(req.params.date).getDay()
    let day = getDayWithCode(dayCode)

    // Comparing day with availability-json. This is an array of objects.
    let timingArray = availability.availabilityTimings[day];

    // if array.length === 1
    if (timingArray.length === 1) {
        const { start, end } = timingArray[0];
        const startTime = timeToMilliseconds(start);
        const endTime = timeToMilliseconds(end);

        if (clientTime < startTime) {
            firstSlot();
            return
        }

        if (clientTime >= startTime && clientTime <= endTime) {
            sameSlot();
            return
        }

        if (clientTime > endTime) {
            nextDaySlot()
            return
        }
    }

    // if array.length >= 1
    if (timingArray.length > 1) {
        for (let i = 0; i < timingArray.length; i++) {
            const { start, end } = timingArray[i];
            const startTime = timeToMilliseconds(start)
            const endTime = timeToMilliseconds(end)

            if (clientTime < startTime) {
                firstSlot();
                return
            }

            if (clientTime >= startTime && clientTime <= endTime) {
                sameSlot();
                return
            }

            // Finding next slot of the same day
            const availableSlot = timingArray[i + 1]
            let nextSlotStartTime;
            if (availableSlot !== undefined) {
                nextSlotStartTime = timeToMilliseconds(availableSlot.start);
            }

            // function to get the same slot of the same day
            if (clientTime > endTime && clientTime < nextSlotStartTime) {
                sameDayNextSlot(i)
                return
            }
            // clientTime > endTime && clientTime <= nextSlotStartTime ? sameDayNextSlot(i) : null

            // if the next slot isn't available then returning next day slot
            if (clientTime > endTime && nextSlotStartTime === undefined) {
                nextDaySlot()
                return
            }
        }
    }

    // if array.length === 0
    if (timingArray.length === 0) {
        day = getDayWithCode(dayCode + 1);
        timingArray = availability.availabilityTimings[day];
        res.status(200).send({
            "isAvailable": false,
            "nextAvailableSlot": {
                "date": getNextDate(req.params.date),
                "time": timingArray[0].start
            }
        })
        return
    }

    // 3 reusable functions -----
    // function for first slot
    function firstSlot() {
        res.send({
            "isAvailable": false,
            "nextAvailableSlot": {
                "date": req.params.date,
                "time": timingArray[0].start
            }
        })
    }
    // function for same slot - isAvailable: true
    function sameSlot() {
        res.status(200).send({ 'isAvailable': true })
    }
    // function for next Day slot - special case for saturday
    function nextDaySlot() {
        // No day is possible for dayCode === 7.
        let newDate = getNextDate(req.params.date)
        if (dayCode === 6) {
            dayCode = 0
            newDate = getNextDate(newDate)
        }
        day = getDayWithCode(dayCode + 1);

        timingArray = availability.availabilityTimings[day];
        res.send({
            "isAvailable": false,
            "nextAvailableSlot": {
                "date": newDate,
                "time": timingArray[0].start
            }
        })
    }

    // function for the next slot the same day
    function sameDayNextSlot(i) {
        res.send({
            "isAvailable": false,
            "nextAvailableSlot": {
                "date": req.params.date,
                "time": timingArray[i + 1].start
            }
        })
    }

})

const PORT = process.env.PORT;
app.listen(PORT, function () {
    console.log(`listening on port ${PORT}`);
})