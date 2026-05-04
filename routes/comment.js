const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const { isLoggedIn, checkCommentOwnership } = require('../middlewares/authMiddleware');

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
            res.redirect('/posts?error=' + encodeURIComponent('댓글 저장 중 오류가 발생했습니다'));
        });
});

// 댓글 삭제
router.delete('/:id/comments/:commentId', isLoggedIn, checkCommentOwnership, (req, res) => {
    const { id, commentId } = req.params;

    Comment.findByIdAndDelete(commentId)
        .then(() => {
            res.redirect(`/posts/${id}`);
        })
        .catch((err) => {
            console.log('댓글 삭제 실패', err);
            res.redirect('/posts?error=' + encodeURIComponent('댓글 삭제 중 오류가 발생했습니다'));
        });
});

module.exports = router;
