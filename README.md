# 간단한 게시판 프로젝트

## 목적

-   공부
-   재미

## Log

-   모델 관련 코드 리뷰 중

## 앞으로 구현할거 (해보고 싶은거)

1. 검색 기능

-   사진 업로드 구현 (GCS)
-   ~~홈 서버 구축해서 거기다 올리기 -> 에바 어려움~~

## stack

기술 스택 : HTML, CSS, AJAX, JavaScript, Node.js, Express.js, mongoDB
배포는 Render

## 그리고 Gemini

이 프로젝트는 (html/css, js 관련 조금 말고는)
제미나이를 통해서 공부하면서 찬찬히 진행되고 있읍니다

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


