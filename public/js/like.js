// 좋아요 버튼: 토글 방식 (1인 1좋아요), 하트 아이콘 시각적 반영

document.addEventListener('DOMContentLoaded', () => {
    const likeBtns = document.querySelectorAll('.likeBtn');
    if (likeBtns.length === 0) return;

    // 버튼 내부를 하트 + 카운트 구조로 교체
    likeBtns.forEach((btn) => {
        const countSpan = btn.querySelector('.likeCount');
        btn.innerHTML = '';

        const heartSpan = document.createElement('span');
        heartSpan.className = 'like-heart';
        heartSpan.textContent = '♡';

        btn.appendChild(heartSpan);
        btn.appendChild(document.createTextNode('\u00A0'));
        btn.appendChild(countSpan);
    });

    // 초기 좋아요 상태 조회
    const postIds = Array.from(likeBtns).map((btn) => btn.dataset.id);

    fetch('/posts/api/liked?ids=' + postIds.join(','))
        .then((res) => (res.ok ? res.json() : { likedIds: [] }))
        .then((data) => {
            const likedSet = new Set(data.likedIds);
            likeBtns.forEach((btn) => {
                if (likedSet.has(btn.dataset.id)) {
                    applyLiked(btn, true);
                }
            });
        })
        .catch(() => {}); // 비로그인 등 무시

    // 클릭 핸들러
    likeBtns.forEach((likeBtn) => {
        likeBtn.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();

            const postId = likeBtn.dataset.id;
            const likeCountSpan = likeBtn.querySelector('.likeCount');

            fetch(`/posts/${postId}/like`, { method: 'POST' })
                .then((res) => {
                    if (!res.ok) throw new Error('요청 실패');
                    return res.json();
                })
                .then((data) => {
                    likeCountSpan.textContent = data.count;
                    applyLiked(likeBtn, data.liked);
                })
                .catch((err) => {
                    console.error('좋아요 처리 중 에러', err);
                });
        });
    });

    function applyLiked(btn, liked) {
        const heart = btn.querySelector('.like-heart');
        if (!heart) return;
        if (liked) {
            heart.textContent = '♥';
            btn.style.color = '#e0374a';
        } else {
            heart.textContent = '♡';
            btn.style.color = '';
        }
    }
});
