import { checkAuth, handleLogin, handleLogout, handleSignup, updateNavbar } from "./auth.js";
import { deletePost, editPost, goToCreatePost, handleCreatePost, handleSearch, handleUpdatePost, handleViewAll, loadPosts, viewPost } from "./posts.js";
import { showMessage, showPage, escapeHTML } from "./utils.js";

// 전역에 함수 노출 (HTML onclick에서 사용)
window.showPage = showPage;
window.showMessage = showMessage;
window.escapeHTML = escapeHTML;
window.handleSignup = handleSignup;
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
window.loadPosts = loadPosts;
window.goToCreatePost = goToCreatePost;
window.handleCreatePost = handleCreatePost;
window.viewPost = viewPost;
window.editPost = editPost;
window.handleUpdatePost = handleUpdatePost;
window.deletePost = deletePost;
window.handleSearch = handleSearch;
window.handleViewAll = handleViewAll;

// 초기화
async function init() {
  await checkAuth();
  updateNavbar();
}

document.addEventListener('DOMContentLoaded', init);