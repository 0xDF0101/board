// 좋아요 버튼: 토글 방식 (1인 1좋아요), 하트 아이콘 시각적 반영

document.addEventListener('DOMContentLoaded', () => {
    function buildHeartUI(btn) {
        if (btn.dataset.initialized) return;
        btn.dataset.initialized = 'true';
        const countSpan = btn.querySelector('.likeCount');
        btn.innerHTML = '';

        const heartSpan = document.createElement('span');
        heartSpan.className = 'like-heart';
        heartSpan.textContent = '♡';

        btn.appendChild(heartSpan);
        btn.appendChild(document.createTextNode(' '));
        btn.appendChild(countSpan);
    }

    function applyLiked(btn, liked) {
        const heart = btn.querySelector('.like-heart');
        if (!heart) return;
        heart.textContent = liked ? '♥' : '♡';
        btn.style.color = liked ? '#e0374a' : '';
    }

    // 초기 렌더링된 버튼 UI 구성
    const initialBtns = Array.from(document.querySelectorAll('.likeBtn'));
    initialBtns.forEach(buildHeartUI);

    // 초기 좋아요 상태 조회
    const postIds = initialBtns.map((btn) => btn.dataset.id).filter(Boolean);
    if (postIds.length > 0) {
        fetch('/posts/api/liked?ids=' + postIds.join(','))
            .then((res) => (res.ok ? res.json() : { likedIds: [] }))
            .then((data) => {
                const likedSet = new Set(data.likedIds);
                document.querySelectorAll('.likeBtn').forEach((btn) => {
                    if (likedSet.has(btn.dataset.id)) applyLiked(btn, true);
                });
            })
            .catch(() => {});
    }

    // 이벤트 위임: 동적으로 추가된 카드도 처리
    document.addEventListener('click', (e) => {
        const likeBtn = e.target.closest('.likeBtn');
        if (!likeBtn) return;
        e.preventDefault();
        e.stopPropagation();

        buildHeartUI(likeBtn);

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
