const Post = require('../models/Post');

// 세션 검사하는 미들웨어

function isLoggedIn(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/users/login');
    }
}

// 현재 로그인한 유저가 이 게시글의 주인인지 확인하는 미들웨어
async function checkPostOwnership(req, res, next) {
    try {
        const post = await Post.findById(req.params.id); // id로 게시글 찾기
        if (!post) {
            return res.status(404).send('게시글을 찾을 수 없습니다.');
        }
        // 글의 주인 id와 현재 로그인한 유저의 id가 같은지 확인
        if (
            req.session.user &&
            (post.author.equals(req.session.user._id) ||
                req.session.user.role === 'admin')
        ) {
            next(); // 주인이 맞으면 통과!
        } else {
            res.status(403).send('권한이 없습니다.'); // 주인이 아니면 거절
        }
    } catch (err) {
        console.log(err);
        res.status(500).send('서버 오류');
    }
}

module.exports = {
    isLoggedIn, // 외부에서 사용할 수 있게 함
    checkPostOwnership,
};
