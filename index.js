const express = require('express');
const app = express(); // express 객체 생성
const PORT = process.env.PORT || 3000;
const path = require('path');
require('dotenv').config();

const mongoose = require('mongoose');

// 정적 파일 경로 설정??
app.use(express.static(path.join(__dirname, 'public')));

// DB 연결
const isProduction = process.env.NODE_ENV === 'production';
const mongoUri = isProduction
    ? process.env.MONGO_PROD_URI
    : process.env.MONGO_DEV_URI;

mongoose
    .connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() =>
        console.log(
            `✅ MongoDB connected to ${isProduction ? 'Production' : 'Dev'} DB`
        )
    )
    .catch((err) => console.error('DB 연결 실패', err));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const methodOverride = require('method-override');
app.use(methodOverride('_method'));
// HTML에서 DELETE요청처럼 인식하게 해주는 코드

app.use(express.urlencoded({ extended: true }));
// 이 미들웨어는 form으로부터 넘어온 title, content의 데이터를 req.body 안에 넣어주는 역할을 함

const postRoutes = require('./routes/posts'); // 라우터 불러오기
// const { promiseImpl } = require('ejs');
const { applyTimestamps } = require('./models/Post');
// comment 관련 라우터
const commentRoutes = require('./routes/comment');

app.use('/comments', commentRoutes); // comments경로는 모두 담당
app.use('/posts', postRoutes); // /posts 경로로 오는 것들은 posts 라우터로 싹 보냄

app.get('/', (req, res) => {
    res.redirect('/posts');
    // res.send('Hello, Anonymous Board');
});

app.get('/test', (req, res) => {
    res.render('posts/index', { postsFromDB: [] });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
