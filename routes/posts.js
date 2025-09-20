const express = require('express');
const path = require('path');
const router = express.Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const {
    isLoggedIn,
    checkPostOwnership,
} = require('../middlewares/authMiddleware'); // 세션확인용 미들웨어

// 새롭게 작성한 글을 저장하는 라우터
router.post('/', isLoggedIn, (req, res) => {
    const { title, content } = req.body; // ejs에서 받아온 데이터 주입
    Post.create({
        title: title,
        content: content,
        likes: 0,
        author: req.session.user._id, // 로그인한 유저의 아이디를 여기 저장
    })
        .then((newPost) => {
            console.log('성공적으로 저장 확인', newPost);
            res.redirect('/posts');
        })
        .catch((err) => {
            console.log('에러 발생', err);
            res.status(500).send('서버 에러 발생');
        });
    // posts.push({ title, content, likes: 0 }); // 여기 부분
    // console.log('현재 게시글 목록:', posts);
});

// index.ejs에 게시글 목록 보여주는 라우터
router.get('/', async (req, res) => {
    try {
        const postsFromDB = await Post.find()
            .populate('author', 'userId') // author 필드를 참조해서 User모델의 userId 필드를 가져옴
            .sort({ createdAt: -1 });
        // ----> await가 이렇게 편하다!
        res.render('posts/index', {
            postsFromDB: postsFromDB,
            sessionUser: req.session.user,
        }); // DB -> ejs로 post넘겨줌
    } catch (err) {
        console.log('DB에서 데이터를 불러오지 못했습니다.', err);
        res.status(500).send('DB 에러 발생');
    }
});

// 새로운 게시글 작성 페이지로 이동
// --->>> isLogined 여기다가 넣었었음
router.get('/new', isLoggedIn, (req, res) => {
    // 로그인 된 사람만 이용 가능
    res.render('../views/new.ejs');
    // res.render('posts/new'); // views 폴더 기준으로 경로를 써주는게 더 깔끔
});

// 게시글 상세 페이지를 보여주는 라우터
router.get('/:id', (req, res) => {
    const id = req.params.id; // 링크에 걸린 _id 땡겨오기
    // comment 관련해서는 어떡하지?

    Post.findById(id)
        .then((post) => {
            if (!post) {
                return res
                    .status(404)
                    .send('해당 게시글을 찾을 수가 없습니다.');
            }
            Comment.find({ post: id })
                .populate('author', 'userId')
                .then((comments) => {
                    res.render('posts/show', {
                        post,
                        comments,
                        sessionUser: req.session.user,
                    }); // 여기서 댓글이랑 같이 보낼 수 있음
                })
                .catch((err) => {
                    console.log('뭔가 잘못됐음요;;', err);
                    res.status(500).send('서버에서 뭔가 오류가 발생했습니다');
                });
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('서버 오류가 발생했습니다.');
        });
});

// 삭제 라우터
router.delete('/:id', isLoggedIn, checkPostOwnership, (req, res) => {
    const id = req.params.id;
    Post.findByIdAndDelete(id)
        .then((deletedPost) => {
            if (!deletedPost) {
                return res
                    .status(404)
                    .send('해당 게시글을 찾지 못해 삭제하지 못했습니다.');
            }
            res.redirect('/posts');
        })
        .catch((err) => {
            console.error('삭제 중 서버 오류', err);
            res.status(500).send('서버 오류입니다.');
        });
});

// 좋아요 버튼 눌렀을때 처리하는 라우터
router.post('/:id/like', isLoggedIn, (req, res) => {
    const id = req.params.id;

    Post.findByIdAndUpdate(id, { $inc: { likes: 1 } }, { new: true })
        .then((updatePost) => {
            if (!updatePost) {
                return res.status(404).send('해당 게시글을 찾지 못했습니다.');
            }
            res.json({ likes: updatePost.likes });
        })
        .catch((err) => {
            console.error('서버 오류', err);
            res.status(500).send('어류가 발생했습니다.');
        });
});

// 수정 페이지 보여주는 라우트
router.get('/:id/edit', isLoggedIn, checkPostOwnership, (req, res) => {
    const id = req.params.id;
    // const post = posts[id];

    Post.findById(id)
        .then((post) => {
            if (!post) {
                return res.status(404).send('해당 게시글이 없습니다.');
            }
            res.render('posts/edit', { post });
        })
        .catch((err) => {
            console.error('서버 에러 발생', err);
            res.status(500).send('오류가 발생했습니다.');
        });

    // res.render('posts/edit', { id, post });
});

// 수정한 데이터를 반영하는 라우터
router.put('/:id', isLoggedIn, checkPostOwnership, (req, res) => {
    const id = req.params.id;
    const { title, content } = req.body;

    if (!title || !content) {
        // 모두 입력되었는지 먼저 확인
        return res.status(400).send('제목과 내용을 모두 입력해주세요');
    }

    Post.findByIdAndUpdate(id, { title, content }, { new: true })
        .then((updatePost) => {
            if (!updatePost) {
                return res.status(404).send('해당 게시글을 찾을 수 없습니다.');
            }
            console.log('수정된 문서:', updatePost);
            res.redirect('/posts/' + id);
        })
        .catch((err) => {
            console.error('수정 중 에러', err);
            res.status(500).send('수정 중 오류가 발생했습니다.');
        });
});

module.exports = router;
