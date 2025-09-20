const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const { isLoggedIn } = require('../middlewares/authMiddleware');

// 댓글 작성
router.post('/:id/comments', isLoggedIn, (req, res) => {
    const id = req.params.id; // id는 게시글 id겠지?
    // 뭔가를 ejs에서 받아와야 함! req.body로
    // 닉네임도 받아와야 하나?
    const { content } = req.body;

    Comment.create({
        content: content,
        post: id,
        author: req.session.user._id,
    })
        .then((newComment) => {
            console.log('성공적으로 댓글 저장', newComment);
            res.redirect(`/posts/${id}`);
        })
        .catch((err) => {
            console.log('댓글 저장이 안됐음!!!!', err);
            res.status(500).send('서버 에러 발생');
        });
});

module.exports = router;
