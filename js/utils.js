export function showMessage(contianer, message, type) {
  contianer.innerHTML = `<div class='alert alert-${type}'>${message}</div>`;
}

export function showPage(pageName) {
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active");
  });
  document.getElementById(pageName).classList.add("active");

  if (pageName === "postList") {
    loadPosts();
  }
}

// 스크립트 주입 공격(XSS)를 막기 위한 유틸리티
export function escapeHTML(text) {
  if (!text) return "";
  const map = {
    "&": "&amp;",
    "<": "&lt",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
