const mongoose = require('mongoose')

const sessionSchema = mongoose.Schema(
    {
        sessionKey: {
            type: String,
            required: [true, "Please enter a session key"]
        },
        sessionName: {
            type: String,
            required: true
        },
        sessionUsers: {
            type: [String],
            required: false
        }
    },
    {
        timestamps: true // time stamp for when data is inserted
    }
)

const Session = mongoose.model('Session', sessionSchema)

module.exports = Session