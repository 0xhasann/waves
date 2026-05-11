import type { ApiResponse } from '../server/units/apiResponse';
import type { UserMeta } from '../shared/types';
import { login } from './dom';
import { conversations, fetchUserConversations, getFriendFromSearch } from './friends/conversation.dom';

export async function signup(e: SubmitEvent) {
  e.preventDefault();

  const userData = {
    username: (document.getElementById('username') as HTMLInputElement).value,
    firstName: (document.getElementById('firstName') as HTMLInputElement).value || undefined,
    lastName: (document.getElementById('lastName') as HTMLInputElement).value || undefined,
    email: (document.getElementById('email') as HTMLInputElement).value || undefined,
    password: (document.getElementById('password') as HTMLInputElement).value,
    avatarURL: (document.getElementById('avatarURL') as HTMLInputElement).value || undefined,
  };

  try {
    const response = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = (await response.json()) as ApiResponse;

    if (response.ok) {
      window.location.href = '/conversation.html';
      console.log(data);
    } else {
      alert(data.message || 'Signup failed');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Something went wrong');
  }
}

export function showForm(type: 'login' | 'signup') {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const buttons = document.querySelectorAll<HTMLButtonElement>('.tab-btn');
  buttons.forEach((btn) => btn.classList.remove('active'));

  if (type === 'login') {
    loginForm?.classList.add('active');
    signupForm?.classList.remove('active');
    buttons[0]?.classList.add('active');
  } else {
    signupForm?.classList.add('active');
    loginForm?.classList.remove('active');
    buttons[1]?.classList.add('active');
  }
}

export async function pageLoader() {
  try {
    const res = await fetch('http://localhost:3000/auth/google/me', {
      credentials: 'include',
    });

    if (!res.ok) {
      if (window.location.pathname !== '/') window.location.href = '/';
      return false;
    }

    const user = (await res.json()) as ApiResponse<UserMeta>;
    if (!user.success || user.error || !user.data) {
      if (window.location.pathname !== '/') window.location.href = '/';
      return false;
    }
    localStorage.setItem('userId', String(user.data.id));
    const isConversationPage = window.location.pathname === '/conversation.html';
    login(user.data.full_name || user.data.username, 'Guest', !isConversationPage);
    await fetchUserConversations();
    const username = getFriendFromSearch();
    if (username) {
      const friend = document.querySelector(`.friend[data-username="${username}"]`) as HTMLElement | undefined;
      if (friend) void conversations(friend);
    }
    return true;
  } catch (err) {
    console.error('Auth check failed, Error :::', err);
  }
}
