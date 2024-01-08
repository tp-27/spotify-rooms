const mongoose = require('mongoose')

const tokenSchema = mongoose.Schema(
    {
        accessToken: {
            type: String,
            required: true
        },
        status: {
            type: Boolean,
            required: true
        }
    },
    {
        timestamps: true // time stamp for when data is inserted
    }
)

const Token = mongoose.model('Token', tokenSchema)

module.exports = Token