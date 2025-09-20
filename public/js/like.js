// 좋아요 버튼을 누르면 **새로고침 없이** 업데이트 하기 위해 AJAX 사용

document.addEventListener('DOMContentLoaded', () => {
    // html 모두 로드된 후 실행하라는 의미
    const likeBtns = document.querySelectorAll('.likeBtn');

    likeBtns.forEach((likeBtn) => {
        likeBtn.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            const postId = likeBtn.dataset.id;
            const likeCountSpan = likeBtn.querySelector('.likeCount');

            fetch(`/posts/${postId}/like`, {
                method: 'POST', // POST를 여기서 명시해주기 때문에 ejs에서 POST 요청 없어도 됨
            })
                .then((res) => {
                    if (!res.ok) throw new Error('요청 실패');
                    return res.json(); // 서버에서 JSON 응답이 올 경우
                    // -> 응답을 JSON으로 파싱
                })
                .then((data) => {
                    // 파싱된 데이터를 활용
                    // 서버에서 새 좋아요 수를 응답했다면 반영
                    likeCountSpan.textContent = data.likes;
                })
                .catch((err) => {
                    console.error('좋아요 처리 중 에러', err);
                });
        });
    });
});
