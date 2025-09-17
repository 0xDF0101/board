// 세션 검사하는 미들웨어

function isLoggedIn(req, res, next) {
    if (req.seesioin.user) {
        next();
    } else {
        res.redirect('/users/login');
    }
}

module.exports = isLoggedIn; // 외부에서 사용할 수 있게 함
