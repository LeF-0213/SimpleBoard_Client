import { escapeHTML, showMessage, showPage } from "./utils.js";

const API_URL = "http://localhost:8080";

// 포스트 목록 조회
export async function loadPosts() {
  const container = document.getElementById("postsContainer");
  if (!container) return;

  container.innerHTML = '<div class="loading>포스트를 불러오는 중...</div>';

  if (!window.currentUser) {
    container.innerHTML = '<div class="alert alert-error">로그인이 필요합니다</div>';
    return;
  }

  const token = localStorage.getItem("token");
  const search = document.getElementById("searchUser")?.value.trim();
  // encodedURIComponent()는 문자열을 URL의 구성요소로 사용할 수 있도록 퍼센트 인코딩 방식으로 변환한다.
  // (주로 검색어의 공백이나 특수문자가 서버로 정확하게 전송되도록 할 때 사용한다.)
  const queryUrl = search ? `${API_URL}/post?search=${encodeURIComponent(search)}` : `${API_URL}/post`;

  try {
    const response = await fetch(queryUrl, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (response.ok && data && data.length > 0) {
      renderPosts(data);
    } else if (response.ok && Array.isArray(data)) {
      container.innerHTML = '<div class="alert alert-info">작성된 포스트가 없습니다.</div>';
    } else {
      container.innerHTML = `<div class=alert alert-error>${data.message || "포스트 로드 실패"}</div>`;
    }
  } catch (error) {
    container.innerHTML = `<div class=alert alert-error>오류: ${error.message}</div>`;
  }
}

// 포스트 렌더링
function renderPosts(posts) {
  const container = document.getElementById("postsContainer");
  if (!container) return;

  const currentUserid = window.currentUser?.userid;

  container.innerHTML = posts
    .map(
      (post) => `
    <div class="post-card">
      <h3 onclick="viewPost('${post._id}')">${escapeHTML(post.title)}</h3>
      <div class="post-meta">
        작성자: ${escapeHTML(post.nickname)} |
        ${new Date(post.createdAt).toLocaleDateString("ko-KR")}
      </div>
      <div class="post-content">${escapeHTML(post.text.substring(0, 150))}...</div>
      <div class="post-actions">
        <button class="btn-primary" onclick="viewPost('${post._id}')">보기</button>
        ${
          post.userid === currentUserid
            ? `
          <button class="btn-primary" onclick="editPost('${post._id}')">수정</button>
          <button class="btn-danger" onclick="deletePost('${post._id}')">삭제</button>
          `
            : ""
        }
      </div>
    </div>
    `
    )
    .join("");
}

// 포스트 작성 페이지 이동
export function goToCreatePost() {
  if (!window.currentUser) {
    alert("로그인이 필요합니다.");
    showPage("login");
    return;
  }
  showPage("postCreate");
}

// 포스트 작성
export async function handleCreatePost() {
  const title = document.getElementById("postTitle")?.value.trim();
  const text = document.getElementById("postContent")?.value.trim();
  const messageDiv = document.getElementById("createMessage");

  if (!messageDiv) return;
  messageDiv.innerHTML = "";

  if (!title || !text) {
    showMessage(messageDiv, "제목과 내용을 입력해주세요.", "error");
    return;
  }

  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${API_URL}/post`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, text }),
    });

    const data = await response.json();

    if (response.ok) {
      showMessage(messageDiv, "포스트가 작성되었습니다.", "success");
      document.getElementById("postTitle").value = "";
      document.getElementById("postContent").value = "";
      setTimeout(() => {
        showPage("postList");
      }, 1500);
    } else {
      showMessage(messageDiv, data.message || "포스트 작성 실패", "error");
    }
  } catch (error) {
    showMessage(messageDiv, "오류: " + error.message, "error");
  }
}

// 포스트 상세 조회
export async function viewPost(postId) {
  const container = document.getElementById("detailContainer");
  if (!container) return;

  container.innerHTML = '<div class="loading">포스트를 불러오는 중...</div>';
  showPage("postDetail");

  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${API_URL}/post/${postId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`},
    });

    const post = await response.json();

    if (response.ok && post) {
      const currentUserid = window.currentUser.userid;

      container.innerHTML = `
        <div class="detail-section">
          <h1 class="detail-title">${escapeHTML(post.title)}</h1>
          <div class="detail-meta">
            작성자: ${escapeHTML(post.userid)} |
            작성일: ${new Date(post.createdAt).toLocaleString("ko-KR")}
          </div>
          <div class="detail-content">${escapeHTML(post.text)}</div>
          <div class="post-actions">
            ${
              post.userid === currentUserid
                ? `<button class="btn-primary" onclick="editPost('${post.id}')">수정하기</button>
              <button class="btn-danger" onclick="deletePost('${post.id}')">삭제하기</button>
            `
                : ""
            }
          </div>
        </div>
      `;
    } else {
      container.innerHTML = `<div class="alert alert-error">${post.message || "포스트 로드 실패"}</div>`;
    }
  } catch (error) {
    container.innerHTML = `<div class="alert alert-error">오류: ${error.message}</div>`;
  }
}

// 포스트 수정 페이지로
export async function editPost(postId) {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${API_URL}/post/${postId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    const post = await response.json();

    if (response.ok && post) {
      document.getElementById("editTitle").value = post.title;
      document.getElementById("editContent").value = post.text;
      window.editingPostId = postId;
      showPage("postEdit");
    } else {
      alsert(post.message || "포스트 로드 실패");
    }
  } catch (error) {
    alert("오류: " + error.message);
  }
}

// 포스트 수정
export async function handleUpdatePost() {
  const title = document.getElementById("editTitle")?.value.trim();
  const text = document.getElementById("editContent")?.value.trim();
  const messageDiv = document.getElementById("editMessage");
  const postId = window.editingPostId;

  if (!messageDiv) return;
  messageDiv.innerHTML = "";

  if (!title || !text) {
    showMessage(messageDiv, "제목과 내용을 입력해주세요.", "error");
    return;
  }

  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${API_URL}/post/${postId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, text }),
    });

    const data = await response.json();

    if (response.ok) {
      showMessage(messageDiv, "포스트가 수정되었습니다!", "success");
      setTimeout(() => {
        viewPost(postId);
      }, 1500);
    } else {
      showMessage(messageDiv, data.message || "포스트 수정 실패", "error");
    }
  } catch (error) {
    showMessage(messageDiv, "오류: " + error.message, "error");
  }
}

// 포스트 삭제
export async function deletePost(postId) {
  if (!confirm("정말 삭제하시겠습니까?")) return;

  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${API_URL}/post/${postId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok || response.status === 204) {
      alert("포스트가 삭제되었습니다.");
      showPage("postList");
    } else {
      const data = await response.json();
      alert(data.message || "포스트 삭제 실패");
    }
  } catch (error) {
    alert("오류: " + error.message);
  }
}

// 사용자별 검색
export async function handleSearch() {
  loadPosts();
}

// 전체 보기
export function handleViewAll() {
  document.getElementById("searchUser").value = "";
  loadPosts();
}
