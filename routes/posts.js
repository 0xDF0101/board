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
        const limit = 16;
        const q = req.query.q ? req.query.q.trim() : '';
        const filter = q
            ? { $or: [{ title: { $regex: q, $options: 'i' } }, { content: { $regex: q, $options: 'i' } }] }
            : {};
        const postsFromDB = await Post.find(filter)
            .populate('author', 'userId role') // author 필드를 참조해서 User모델의 userId 필드를 가져옴
            // --> ref로 서로 참조하고 있기 때문에 다른 모델에서 관리해도 가져올 수 있음
            .sort({ createdAt: -1 })
            .limit(limit);

        const postIds = postsFromDB.map(p => p._id);
        const commentCounts = await Comment.aggregate([
            { $match: { post: { $in: postIds } } },
            { $group: { _id: '$post', count: { $sum: 1 } } },
        ]);
        const countMap = {};
        commentCounts.forEach(c => { countMap[c._id.toString()] = c.count; });

        const postsWithCounts = postsFromDB.map(p => ({
            ...p.toObject(),
            commentCount: countMap[p._id.toString()] || 0,
            likes: (p.likes || []).length,
        }));

        // ----> await가 이렇게 편하다!
        res.render('posts/index', {
            postsFromDB: postsWithCounts,
            sessionUser: req.session.user,
            q,
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

// 현재 유저가 좋아요 누른 게시글 id 목록 반환 (like.js 초기 상태용)
router.get('/api/liked', (req, res) => {
    if (!req.session.user) {
        return res.json({ likedIds: [] });
    }
    const ids = (req.query.ids || '').split(',').filter(Boolean);
    if (ids.length === 0) {
        return res.json({ likedIds: [] });
    }
    const userId = req.session.user._id;
    Post.find({ _id: { $in: ids }, likes: userId }, '_id')
        .then((posts) => {
            res.json({ likedIds: posts.map(p => p._id.toString()) });
        })
        .catch(() => res.json({ likedIds: [] }));
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
                    const postData = { ...post.toObject(), likes: (post.likes || []).length };
                    res.render('posts/show', {
                        post: postData,
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
    const userId = req.session.user._id;

    Post.findById(id)
        .then((post) => {
            if (!post) {
                res.status(404).json({ message: '해당 게시글을 찾지 못했습니다.' });
                return null;
            }
            if (!Array.isArray(post.likes)) post.likes = [];
            const alreadyLiked = post.likes.some(uid => uid.equals(userId));
            if (alreadyLiked) {
                post.likes.pull(userId);
            } else {
                post.likes.push(userId);
            }
            return post.save();
        })
        .then((updatedPost) => {
            if (!updatedPost) return;
            const liked = updatedPost.likes.some(uid => uid.equals(userId));
            res.json({ liked, count: updatedPost.likes.length });
        })
        .catch((err) => {
            console.error('서버 오류', err);
            res.status(500).send('오류가 발생했습니다.');
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

// AJAX 요청용 새로운 라우터
router.get('/api/posts', async (req, res) => {
    try {
        const page = parseInt(req.query.page || '1'); // 기본값 1페이지
        const limit = 16; // 페이지 당 10개씩
        const skip = (page - 1) * limit;
        const q = req.query.q ? req.query.q.trim() : '';
        const filter = q
            ? { $or: [{ title: { $regex: q, $options: 'i' } }, { content: { $regex: q, $options: 'i' } }] }
            : {};

        const posts = await Post.find(filter)
            .populate('author', 'userId role')
            .sort({ createdAt: -1 })
            .skip(skip) // 요만큼 건너뛰고
            .limit(limit); // 요만큼 가져오기
        const totalPosts = await Post.countDocuments(filter); // 전체 게시글 수 확인

        const postIds = posts.map(p => p._id);
        const commentCounts = await Comment.aggregate([
            { $match: { post: { $in: postIds } } },
            { $group: { _id: '$post', count: { $sum: 1 } } },
        ]);
        const countMap = {};
        commentCounts.forEach(c => { countMap[c._id.toString()] = c.count; });

        const postsWithCounts = posts.map(p => ({
            ...p.toObject(),
            commentCount: countMap[p._id.toString()] || 0,
            likes: (p.likes || []).length,
        }));

        res.json({
            posts: postsWithCounts,
            totalPages: Math.ceil(totalPosts / limit),
        });
    } catch (err) {
        res.status(500).json({ message: '서버 오류' });
    }
});

module.exports = router;
