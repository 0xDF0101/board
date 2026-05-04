const express = require('express');
const router = express.Router();
const User = require('../models/User'); // 사용자 모델을 불러옴
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const bcrypt = require('bcrypt');
const { isLoggedIn } = require('../middlewares/authMiddleware');
const { upload, uploadProfileImage } = require('../middlewares/upload');

// 회원가입 페이지 보여주기
router.get('/register', (req, res) => {
    res.render('user/register');
});

// 회원 등록하기
router.post('/register', async (req, res) => {
    const { userId, userPw } = req.body;

    // ID 중복성 검사
    const existingUser = await User.findOne({ userId });
    if (existingUser) {
        return res.redirect('/users/register?error=' + encodeURIComponent('이미 존재하는 아이디입니다'));
    }

    try {
        const hash = await bcrypt.hash(userPw, 10); // 비밀번호 해싱
        const newUser = new User({ userId, userPw: hash }); // 인스턴스 생성
        await newUser.save();
        // new + save() == Create() 같은 기능임
        console.log(`회원가입 성공, USER ID : ${newUser.userId}`);
        res.redirect('login'); // login 페이지로 이동
    } catch (err) {
        console.error('회원가입 실패', err);
        res.redirect('/users/register?error=' + encodeURIComponent('서버 오류'));
    }
});

// id 중복 체크용 라우터
router.get('/check-duplicate', async (req, res) => {
    const userId = req.query.userId;

    try {
        const user = await User.findOne({ userId });
        res.json({ exists: !!user }); // true or false
    } catch (err) {
        console.error('중복 검사 에러', err);
        res.status(500).json({ error: '서버 오류' });
    }
});

router.get('/login', async (req, res) => {
    res.render('user/login');
});

router.post('/login', async (req, res) => {
    const { userId, userPw } = req.body;

    try {
        // id 존재 여부
        const user = await User.findOne({ userId });
        if (!user) {
            return res.redirect('/users/login?error=' + encodeURIComponent('존재하지 않는 아이디입니다'));
        }

        // 비밀번호 일치 여부
        const isMatch = await bcrypt.compare(userPw, user.userPw);
        // userPw는 사용자가 입력한 친구
        // user.userPw는 DB에서 가져온 친구
        if (!isMatch) {
            return res.redirect('/users/login?error=' + encodeURIComponent('비밀번호가 일치하지 않습니다'));
        }

        // 로그인 성공 -> 세션에 정보 저장
        req.session.user = {
            // 요청마다 얘를 확인하는거임
            _id: user._id,
            userId: user.userId,
            role: user.role,
        };
        console.log('로그인 성공 : ', userId);
        console.log('현재 세션 : ', req.session);
        res.redirect('/posts');
    } catch (err) {
        console.error('로그인 실패', err);
        res.redirect('/users/login?error=' + encodeURIComponent('서버 오류'));
    }
});

// logout 라우터
router.get('/logout', (req, res) => {
    console.log('로그아웃 : ', req.session.user?.userId);

    req.session.destroy((err) => {
        if (err) {
            console.log('로그아웃 실패');
            return res.redirect('/posts?error=' + encodeURIComponent('로그아웃 중 오류 발생'));
        }
        res.redirect('/posts');
    });
});

// 마이페이지 보여주기
router.get('/mypage', isLoggedIn, async (req, res) => {
    try {
        const user = await User.findById(req.session.user._id);
        if (!user) return res.redirect('/posts?error=' + encodeURIComponent('사용자를 찾을 수 없습니다'));

        const myPosts = await Post.find({ author: req.session.user._id })
            .select('title imageUrl createdAt likes')
            .sort({ createdAt: -1 })
            .lean();

        const commentCounts = await Comment.aggregate([
            { $match: { post: { $in: myPosts.map(p => p._id) } } },
            { $group: { _id: '$post', count: { $sum: 1 } } }
        ]);
        const commentCountMap = {};
        commentCounts.forEach(c => { commentCountMap[c._id.toString()] = c.count; });
        myPosts.forEach(p => { p.commentCount = commentCountMap[p._id.toString()] || 0; });

        res.render('user/mypage', { sessionUser: req.session.user, user, myPosts });
    } catch (err) {
        console.error('마이페이지 로딩 실패', err);
        res.redirect('/posts?error=' + encodeURIComponent('서버 오류'));
    }
});

// 닉네임 변경
router.post('/mypage/nickname', isLoggedIn, async (req, res) => {
    const { nickname } = req.body;
    if (!nickname || nickname.trim().length < 2 || nickname.trim().length > 10) {
        return res.redirect('/users/mypage?error=' + encodeURIComponent('닉네임은 2~10자여야 합니다'));
    }
    try {
        const user = await User.findById(req.session.user._id);
        if (!user) return res.redirect('/posts?error=' + encodeURIComponent('사용자를 찾을 수 없습니다'));
        user.nickname = nickname.trim();
        await user.save();
        res.redirect('/users/mypage');
    } catch (err) {
        console.error('닉네임 변경 실패', err);
        res.redirect('/users/mypage?error=' + encodeURIComponent('서버 오류'));
    }
});

// 프로필 이미지 변경
router.post('/mypage/profile-image', isLoggedIn, upload.single('profileImage'), async (req, res) => {
    if (!req.file) {
        return res.redirect('/users/mypage?error=' + encodeURIComponent('파일이 없습니다'));
    }
    try {
        const user = await User.findById(req.session.user._id);
        if (!user) return res.redirect('/posts?error=' + encodeURIComponent('사용자를 찾을 수 없습니다'));
        user.profileImage = await uploadProfileImage(req.file, user.userId);
        await user.save();
        res.redirect('/users/mypage');
    } catch (err) {
        console.error('프로필 이미지 변경 실패', err);
        res.redirect('/users/mypage?error=' + encodeURIComponent('서버 오류'));
    }
});

// 마이페이지 통합 업데이트
router.post('/mypage/update', isLoggedIn, upload.single('profileImage'), async (req, res) => {
    try {
        const user = await User.findById(req.session.user._id);
        if (!user) return res.redirect('/posts?error=' + encodeURIComponent('사용자를 찾을 수 없습니다'));

        const nickname = req.body.nickname ? req.body.nickname.trim() : '';
        if (nickname && nickname !== (user.nickname || '')) {
            if (nickname.length < 2 || nickname.length > 10) {
                return res.redirect('/users/mypage?error=' + encodeURIComponent('닉네임은 2~10자여야 합니다'));
            }
            user.nickname = nickname;
        }

        if (req.file) {
            user.profileImage = await uploadProfileImage(req.file, user.userId);
        }

        await user.save();
        res.redirect('/users/mypage');
    } catch (err) {
        console.error('마이페이지 업데이트 실패', err);
        res.redirect('/users/mypage?error=' + encodeURIComponent('서버 오류'));
    }
});

// 유저 검색
router.get('/search', async (req, res) => {
    const q = req.query.q ? req.query.q.trim() : '';
    if (!q) return res.redirect('/posts');
    try {
        const user = await User.findOne({
            $or: [
                { userId: { $regex: q, $options: 'i' } },
                { nickname: { $regex: q, $options: 'i' } }
            ]
        });
        if (!user) {
            return res.redirect('/posts?error=' + encodeURIComponent('존재하지 않는 유저입니다'));
        }
        res.redirect(`/users/${user.userId}`);
    } catch (err) {
        console.error('유저 검색 실패', err);
        res.redirect('/posts?error=' + encodeURIComponent('서버 오류'));
    }
});

// 공개 프로필 페이지
router.get('/:userId', async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.params.userId });
        if (!user) return res.redirect('/posts?error=' + encodeURIComponent('사용자를 찾을 수 없습니다'));

        const posts = await Post.find({ author: user._id })
            .select('title imageUrl createdAt likes')
            .sort({ createdAt: -1 })
            .lean();

        const commentCounts = await Comment.aggregate([
            { $match: { post: { $in: posts.map(p => p._id) } } },
            { $group: { _id: '$post', count: { $sum: 1 } } }
        ]);
        const commentCountMap = {};
        commentCounts.forEach(c => { commentCountMap[c._id.toString()] = c.count; });
        posts.forEach(p => { p.commentCount = commentCountMap[p._id.toString()] || 0; });

        const totalLikes = posts.reduce((sum, p) => sum + p.likes.length, 0);

        res.render('user/profile', { sessionUser: req.session.user, user, posts, totalLikes });
    } catch (err) {
        console.error('프로필 페이지 로딩 실패', err);
        res.redirect('/posts?error=' + encodeURIComponent('서버 오류'));
    }
});

module.exports = router;
