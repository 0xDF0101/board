// 로그인을 위한 사용자 모델

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
    },
    {
        timestamps: true,
    }
);

// 위에서 만든 구조를 기반으로 모델 생성
const User = mongoose.model('User', userSchema);

// export
module.exports = User;
