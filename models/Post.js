// 이건 post모델 파일임
// 라우터 아님

const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        content: String,
        likes: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    }
);

// 모델 생성
// 위에서 만든 구조(스키마)를 기반으로 모델을 생성
const Post = mongoose.model('Post', postSchema);

// 외부에서 사용할 수 있게 export
module.exports = Post;
