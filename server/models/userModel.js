const mongoose = require('mongoose')

const userSchema = mongoose.Schema(
    {
        userId: {
            type: String,
            required: true
        },
        accessToken: {
            type: String,
            required: false
        },
        name: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true // time stamp for when data is inserted
    }
)

const User = mongoose.model('User', userSchema)

module.exports = User