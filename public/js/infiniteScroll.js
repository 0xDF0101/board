// public/js/infiniteScroll.js

document.addEventListener('DOMContentLoaded', () => {
    const postContainer = document.getElementById('post-container');
    const loading = document.getElementById('loading');

    let page = 1;
    let isLoading = false;
    let hasMore = true;

    // 좋아요 버튼 이벤트 위임 (새로 생긴 카드에서도 작동하도록)
    postContainer.addEventListener('click', function (event) {
        const likeBtn = event.target.closest('.likeBtn');
        if (likeBtn) {
            event.preventDefault();
            event.stopPropagation();

            const postId = likeBtn.dataset.id;
            const likeCountSpan = likeBtn.querySelector('.likeCount');

            fetch(`/posts/${postId}/like`, { method: 'POST' })
                .then((res) => {
                    if (!res.ok) throw new Error('Like request failed');
                    return res.json();
                })
                .then((data) => {
                    likeCountSpan.textContent = data.likes;
                })
                .catch((err) => console.error(err));
        }
    });

    const loadMorePosts = async () => {
        if (isLoading || !hasMore) return;

        isLoading = true;
        loading.style.display = 'block';
        page++;

        try {
            const response = await fetch(`/posts/api/posts?page=${page}`);
            const data = await response.json();

            if (data.posts && data.posts.length > 0) {
                data.posts.forEach((post) => {
                    const postElement = document.createElement('div');
                    postElement.classList.add('col-12', 'col-md-6', 'mb-4');
                    const authorId = post.author
                        ? post.author.userId
                        : '알 수 없음';
                    const authorBadge =
                        post.author && post.author.role === 'admin'
                            ? '<span class="badge bg-primary">관리자</span>'
                            : '';

                    postElement.innerHTML = `
                        <div class="card h-100" style="position: relative;">
                            <div class="card-body d-flex flex-column">
                                <h5 class="card-title">
                                    <a href="/posts/${
                                        post._id
                                    }" class="no-style-link stretched-link"><strong>${
                        post.title
                    }</strong></a>
                                </h5>
                                <p class="card-text truncate-lines">${post.content.trim()}</p>
                                <div class="mt-auto">
                                    <button class="btn btn-sm btn-outline-danger likeBtn" data-id="${
                                        post._id
                                    }" style="position: relative; z-index: 2;">
                                        Like <span class="likeCount">${
                                            post.likes
                                        }</span>
                                    </button>
                                </div>
                            </div>
                            <div class="card-footer bg-transparent border-top-0 d-flex justify-content-between align-items-center">
                                <small class="text-muted">
                                    작성자: <strong>${authorId}</strong> ${authorBadge}
                                </small>
                                <small class="text-muted">
                                    ${new Date(post.createdAt).toLocaleString(
                                        'ko-KR'
                                    )}
                                </small>
                            </div>
                        </div>
                    `;
                    postContainer.appendChild(postElement);
                });
            } else {
                hasMore = false; // 더 이상 가져올 게시물이 없음
                loading.innerHTML = '<p>모든 게시물을 불러왔습니다.</p>';
            }
        } catch (error) {
            console.error('게시글 추가 로딩 실패:', error);
            loading.innerHTML = '<p>게시물을 불러오는 데 실패했습니다.</p>';
        } finally {
            isLoading = false;
            // '더 이상 게시물이 없음' 메시지를 계속 보여주기 위해, hasMore가 false일 땐 로딩 UI를 숨기지 않음
            if (hasMore) {
                loading.style.display = 'none';
            }
        }
    };

    // 스크롤 이벤트 감지
    window.addEventListener('scroll', () => {
        if (
            window.innerHeight + window.scrollY >=
            document.documentElement.scrollHeight - 1
        ) {
            loadMorePosts();
        }
    });
});
