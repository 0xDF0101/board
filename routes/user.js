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
        res.redirect('/login'); // login 페이지로 이동
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

// 얘가 뭐하는 코드더라.../
module.exports = router;
