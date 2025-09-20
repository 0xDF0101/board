const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
    {
        content: { type: String, required: true },
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            required: true,
        },
        author: {
            // 로그인 관련
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // User 모델 참조
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Comment', commentSchema);
