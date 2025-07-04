const express = require('express');
const path = require('path');
const router = express.Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');

// let posts = [];

// 새롭게 작성한 글을 저장하는 라우터
router.post('/', (req, res) => {
    const { title, content } = req.body;
    Post.create({
        title: title,
        content: content,
        likes: 0,
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
router.get('/', (req, res) => {
    Post.find()
        .sort({ createdAt: -1 }) // createdA을 기준으로 내림차순 정렬
        .then((postsFromDB) => {
            res.render('posts/index', { postsFromDB });
        })
        .catch((err) => {
            console.log('DB에서렬데이터를 불러오지 못했습니다.', err);
            res.status(500).send('DB 에러 발생');
        });
    // res.render('posts/index', { posts }); // 여기 부분
});

// 새로운 게시글 작성 페이지로 이동
router.get('/new', (req, res) => {
    res.render('../views/new.ejs');
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
                .then((comments) => {
                    res.render('posts/show', { post, comments }); // 여기서 댓글이랑 같이 보낼 수 있음
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
router.delete('/:id', (req, res) => {
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
router.post('/:id/like', (req, res) => {
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
router.get('/:id/edit', (req, res) => {
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
router.put('/:id', (req, res) => {
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
