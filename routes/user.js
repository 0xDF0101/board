const express = require('express');
const router = express.Router();
const User = require('../models/User'); // 사용자 모델을 불러옴
const bcrypt = require('bcrypt');

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
        return res.status(400).send('이미 존재하는 아이디입니다.');
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
        res.status(500).send('서버 오류');
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
            return res.status(400).send('존재하지 않는 아이디입니다.');
        }

        // 비밀번호 일치 여부
        const isMatch = await bcrypt.compare(userPw, user.userPw);
        // userPw는 사용자가 입력한 친구
        // user.userPw는 DB에서 가져온 친구
        if (!isMatch) {
            return res.status(400).send('비밀번호가 일치하지 않습니다.');
        }

        console.log('로그인 성공 : ', userId);
        res.redirect('/posts');
    } catch (err) {
        console.error('로그인 실패', err);
        res.status(500).send('서버 오류');
    }
});

// 얘가 뭐하는 코드더라.../
module.exports = router;
