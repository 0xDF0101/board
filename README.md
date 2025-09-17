# 간단한 게시판 프로젝트

## stack

HTML, CSS, AJAX, JavaScript, Node.js, Express.js, mongoDB

## Log

-   로그인 기능 구현 중
-   메인 페이지 필요

## 그리고 영원한 동반자 ChatGPT
이 프로젝트는 html/css, js 관련 지식 쬐끔 말고는
모두 GPT선생님과 협업으로 진행되고 있습니다.


## 구조

```
anonymous-board/
├─ index.js # 앱 진입점(Express 설정, 미들웨어, 라우터 등록)
├─ package.json # 중존성·실행 스크립트
├─ .env # 민감정보(로컬에만) — MONGO_URI, SESSION_SECRET 등
├─ models/
│ ├─ Post.js # Mongoose 스키마(게시글)
│ ├─ Comment.js # 댓글 스키마 (post ref)
│ └─ User.js # 사용자(회원) 스키마조
├─ routes/
│ ├─ posts.js # /posts 관련 라우터 (목록, 생성, 상세, 수정, 삭제, 좋아요)
│ ├─ comment.js # 댓글 생성 등
│ └─ user.js # 회원가입/로그인/로그아웃
├─ views/ # EJS 템플릿
│ ├─ partials/
│ │ ├─ header.ejs
│ │ └─ footer.ejs
│ └─ posts/
│ ├─ index.ejs
│ ├─ show.ejs
│ └─ edit.ejs
├─ public/ # 정적 파일 (CSS/JS/이미지)
│ ├─ css/
│ │ └─ style.css
│ └─ js/
│ ├─ like.js # 클라이언트 AJAX (좋아요)
│ └─ validate.js # 프론트 유효성 검사(AJAX)
└─ README.md
```

