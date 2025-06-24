const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

// 회원가입 페이지 보여주기
router.get('/register', (req, res) => {
    res.render('../views/user/register.ejs');
});

// 회원 등록하기
router.post('/register', async (req, res) => {
    const { id, pw } = req.body;

    try {
        const hash = await bcrypt.hash(pw, 10); // 비밀번호 해싱
        const newUser = new User({ id, pw: hash });
        await newUser.save();
        res.redirect('/login'); // login 페이지로 이동
    } catch (err) {
        console.error('회원가입 실패', err);
        res.status(500).send('서버 오류');
    }
});

// 얘가 뭐하는 코드더라.....
module.exports = router;
