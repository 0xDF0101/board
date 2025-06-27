// 회원가입시, ID 중복성 검사와 PW 유효성 검사를 한 뒤 새로고침 없이 이어나가기 위한 AJAX 코드

document.addEventListener('DOMContentLoaded', () => {
    // html 모두 로드된 후 실행하라는 의미
    const userIdInput = document.getElementById('userId');
    const idFeedback = document.getElementById('idFeedback');
    const userPwInput = document.getElementById('userPw');
    const pwFeedback = document.getElementById('pwFeedback');
    // console.log('전송된 id', req.body.userId);

    idFeedback.textContent = 'js파일이 잘 먹히고 있나?';

    // id 중복 체크
    userIdInput.addEventListener('blur', async () => {
        // id입력하고 커서가 off가 되면 실행됨
        const userId = userIdInput.value.trim();
        if (userId === '') {
            // idFeedback.classList.remove('text-success', 'text-danger');

            return; // 공백 안된단 말인듯
        }

        try {
            const res = await fetch(`/users/check-duplicate?userId=${userId}`);
            // 해당 경로로 get요청을 보냄
            const data = await res.json(); // 응답 온 데이터를 파싱함

            if (data.exists) {
                idFeedback.textContent = '이미 사용 중인 아이디입니다.';
                idFeedback.classList.remove('text-success');
                idFeedback.classList.add('text-danger');
            } else {
                idFeedback.textContent = '사용 가능한 아이디입니다.';
                idFeedback.classList.remove('text-danger');
                idFeedback.classList.add('text-success');
            }
        } catch (err) {
            idFeedback.textContent = '서버 오류';
            idFeedback.classList.remove('text-success');
            idFeedback.classList.add('text-danger');
        }
    });

    userPwInput.addEventListener('input', () => {
        if (userPwInput.value.length < 8) {
            pwFeedback.textContent = '비밀번호는 최소 8자 이상이여야 합니다.';
        } else {
            pwFeedback.textContent = '';
        }
    });
});
