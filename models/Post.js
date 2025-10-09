// 이건 post모델 파일임
// 라우터 아님
// mongoose 스키마를 통해 noSQLDB를 SQLDB처럼 만들어준다

const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        content: String,
        likes: { type: Number, default: 0 },
        author: {
            // 로그인 관련
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // User 모델 참조 --> join과 같은 개념이라고 할 수 있다!
            require: true,
        },
    },
    {
        // 생성 시간과 마지막 수정 시간을 자동으로 관리해줌
        // createAt과 UpdateAt 두개가 자동으로 생성되고, 사용 가능
        timestamps: true,
    }
);

// 모델 생성
// 위에서 만든 구조(스키마)를 기반으로 모델을 생성
const Post = mongoose.model('Post', postSchema);

// 외부에서 사용할 수 있게 export
module.exports = Post;
