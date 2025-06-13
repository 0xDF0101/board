const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
    {
        content: { type: String, required: ture },
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Comment', commentSchema);
