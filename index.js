const express = require('express');
const app = express(); // express 객체 생성
const PORT = 3000;
const path = require('path');
require('dotenv').config();

const mongoose = require('mongoose');

mongoose
    .connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('DB 연결 성공'))
    .catch((err) => console.error('DB 연결 실패', err));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const methodOverride = require('method-override');
app.use(methodOverride('_method'));
// HTML에서 DELETE요청처럼 인식하게 해주는 코드

app.use(express.static('public')); // 정적 파일 제공
app.use(express.urlencoded({ extended: true }));
// 이 미들웨어는 form으로부터 넘어온 title, content의 데이터를 req.body 안에 넣어주는 역할을 함

const postRoutes = require('./routes/posts'); // 라우터 불러오기
// const { promiseImpl } = require('ejs');
const { applyTimestamps } = require('./models/Post');
app.use('/posts', postRoutes); // /posts 경로로 오는 것들은 posts 라우터로 싹 보냄

app.get('/', (req, res) => {
    res.send('Hello, Anonymous Board');
});

app.get('/test', (req, res) => {
    res.render('posts/index', { postsFromDB: [] });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
