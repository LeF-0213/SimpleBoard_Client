import { showMessage, showPage } from "./utils.js";

const API_URL = "http://localhost:8080";

// 네비게이션 업데이트
export function updateNavbar() {
  const navbarRight = document.getElementById("navbarRight");

  if (window.currentUser) {
    navbarRight.innerHTML = `
      <div class="user-info">👤 ${escapeHTML(window.currentUser.userid)}</div>
      <button class="btn-danger" onclick="handleLogout()">로그아웃</button>
    `;
  } else {
    navbarRight.innerHTML = `
      <button class="btn-primary" onclick="showPage('login')">로그인</button>
    `;
  }
}

// 회원가입
export async function handleSignup() {
  const userid = document.getElementById("signupUserid")?.value.trim();
  const password = document.getElementById("signupPassword")?.value;
  const passwordConfirm = document.getElementById("signupPasswordConfirm")?.value;
  const nickname = document.getElementById("signupNickname")?.value.trim();
  const email = document.getElementById("signupEmail")?.value.trim();
  const messageDiv = document.getElementById("signupMessage");

  if (!messageDiv) return;
  messageDiv.innerHTML = "";

  if (!userid || !password || !passwordConfirm || !nickname || !email) {
    showMessage(messageDiv, "모든 필드를 입력해주세요", "error");
    return;
  }

  if (password !== passwordConfirm) {
    showMessage(messageDiv, "비밀번호가 일치하지 않습니다.", "error");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userid, password, nickname, email }),
    });

    /* 
      실패 응답에도 서버가 유효한 JSON 에러 본문을 보낼 경우,
      클라이언트에서 이 에러 메시지를 data 변수를 통해 사용한다.
      때문에 response.ok 전에 data 변수를 통해 서버가 보낸 에러메시지를,
      클라이언트가 접근할 수 있도록 하기 위함이다.
    */
    const data = await response.json();

    if (response.ok) {
      showMessage(messageDiv, "회원가입 성공! 로그인해주세요.", "success");
      setTimeout(() => {
        document.getElementById("signupUserid").value = "";
        document.getElementById("signupPassword").value = "";
        document.getElementById("signupPasswordConfirm").value = "";
        document.getElementById("signupNickname").value = "";
        document.getElementById("signupEmail").value = "";
        showPage("login");
      }, 1500);
    } else {
      showMessage(messageDiv, data.message || "회원가입 실패", "error");
    }
  } catch (error) {
    showMessage(messageDiv, "오류: " + error.message, "error");
  }
}

// 로그인
export async function handleLogin() {
  const userid = document.getElementById("loginUserid")?.value.trim();
  const password = document.getElementById("loginPassword")?.value;
  const messageDiv = document.getElementById("loginMessage");

  if (!messageDiv) return;
  messageDiv.innerHTML = "";

  if (!userid || !password) {
    showMessage(messageDiv, "아이디와 비밀번호를 입력해주세요.", "error");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userid, password }),
    });

    const data = await response.json();

    if (response.ok && data.token) {
      // JWT 토큰을 localStorage에 저장
      localStorage.setItem("token", data.token);
      window.currentUser = data.user;
      updateNavbar();
      showMessage(messageDiv, "로그인 성공!", "success");
      setTimeout(() => {
        document.getElementById("loginUserid").value = "";
        document.getElementById("loginPassword").value = "";
        showPage("postList");
      }, 1000);
    } else {
      showMessage(messageDiv, data.message || "로그인 실패", "error");
    }
  } catch (error) {
    showMessage(messageDiv, "오류: " + error.message, "error");
  }
}

// 로그아웃
export function handleLogout() {
  localStorage.removeItem("token");
  window.currentUser = null;
  updateNavbar();
  showPage("login");
}

// 로그인 상태 확인
export async function checkAuth() {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });

    /* 
    실패 응답에 JSON이 아닌 다른 형식이 올 때(HTML로 된 오류 페이지 등),
    파싱 에러를 방지한다.(Uncaught SyntaxError: Unexpected token...)
    */
    if (response.ok) {
      const data = await response.json();
      window.currentUser = data;
      showPage("postList");
      return true;
    } else {
      window.currentUser = null;
      showPage("login");
      return false;
    }
  } catch (error) {
    console.error("Auth check error:", error);
    window.currentUser = null;
    showPage("login");
    return false;
  }
}
