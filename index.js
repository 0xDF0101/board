const express = require('express');
const app = express(); // express 객체 생성
const PORT = process.env.PORT || 3000;
const path = require('path');
const session = require('express-session'); // ---> 세션 관리
const isLoggedIn = require('./middlewares/authMiddleware');

require('dotenv').config(); // .env에서 환경 변수를 불러올 수 있음

const mongoose = require('mongoose');
// ---> 모델 불러오김

// 정적 파일 경로 설정??
app.use(express.static(path.join(__dirname, 'public')));

// DB 연결
// 로컬에서 돌릴땐 자동을 DEV용 DB로 전환됨 ---> 환경변수를 그렇게 설정해놨거든
const isProduction = process.env.NODE_ENV === 'production';
const mongoUri = isProduction
    ? process.env.MONGO_PROD_URI
    : process.env.MONGO_DEV_URI;

// promise를 이용한 비동기 처리
mongoose
    .connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() =>
        // 만약 연결 성공하면 이걸 실행하고
        console.log(
            `✅ MongoDB connected to ${isProduction ? 'Production' : 'Dev'} DB`
        )
    )
    .catch((err) => console.error('DB 연결 실패', err)); // 연결 실패하면 이걸 실행하는거임

app.set('view engine', 'ejs'); // ejs를 view엔진으로 설정하는 듯?
app.set('views', path.join(__dirname, 'views')); // 경로설정 하는 거인듯
// __dirname : index.js 파일이 존재하는 폴더를 의미함!!

const methodOverride = require('method-override');
app.use(methodOverride('_method'));
// HTML에서 DELETE요청처럼 인식하게 해주는 코드

app.use(express.urlencoded({ extended: true }));
// 이 미들웨어는 form으로부터 넘어온 title, content의 데이터를 req.body 안에 넣어주는 역할을 함
// 요청이 넘어올때 파라미터로 넘어오는 놈들을 js객체 형태로 번역해서 라우터한테 전달하는 역살
// 사실상 얘가 요청을 제일 먼저 받는 애임

// 세션 설정
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false, // 요청이 왔을때, 세션에 변경 사항 없으면 저장x
        saveUninitialized: true, // 초기화되지 않은 세션을 저장할지 여부, 로그인하지 않은 유저에 대한 세션을 만들지 않음
        cookie: { maxAge: 1000 * 60 * 60 }, // 세션 유지 시간 : 1h
    })
);

const postRoutes = require('./routes/posts'); // 라우터 불러오기
// const { promiseImpl } = require('ejs');
const { applyTimestamps } = require('./models/Post');
// ---> 중괄호로 감싸져 있는 건, Post에서 applyTimestamps만 가져와서 쓰겠다는 의미
// comment 관련 라우터
const commentRoutes = require('./routes/comment');
const userRoutes = require('./routes/user');
// --> 구현해놓은 기능들을 require()로 가져와서 객체에 저장

app.use('/comments', commentRoutes); // comments경로는 모두 담당
app.use('/posts', postRoutes); // /posts 경로로 오는 것들은 posts 라우터로 싹 보냄
app.use('/users', userRoutes);
// ----> use()는 분기 역할을 한다!

// 기본적인 요청 처리
app.get('/', (req, res) => {
    res.redirect('/posts');
    // res.send('Hello, Anonymous Board');
});

app.get('/test', (req, res) => {
    res.render('posts/index', { postsFromDB: [] });
});

app.listen(PORT, () => {
    // java에서 socketServer의 accept()랑 비슷한 역할을 하는 듯
    console.log(`Server running at http://localhost:${PORT}`);
});
