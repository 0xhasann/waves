import { login } from "./dom";

export async function signup(e: SubmitEvent) {
  e.preventDefault();

  const userData = {
    username: (document.getElementById("username") as HTMLInputElement).value,
    firstName: (document.getElementById("firstName") as HTMLInputElement).value || undefined,
    lastName: (document.getElementById("lastName") as HTMLInputElement).value || undefined,
    email: (document.getElementById("email") as HTMLInputElement).value || undefined,
    password: (document.getElementById("password") as HTMLInputElement).value,
    avatarURL: (document.getElementById("avatarURL") as HTMLInputElement).value || undefined,
  };

  try {
    const response = await fetch("http://localhost:3000/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (response.ok) {
      window.location.href = "/conversation_timeline.html";
      console.log(data);
    } else {
      alert(data.message || "Signup failed");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Something went wrong");
  }

}

export function showForm(type: "login" | "signup") {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const buttons = document.querySelectorAll<HTMLButtonElement>(".tab-btn");
  buttons.forEach((btn) => btn.classList.remove("active"));

  if (type === "login") {
    loginForm?.classList.add("active");
    signupForm?.classList.remove("active");
    buttons[0]?.classList.add("active");
  } else {
    signupForm?.classList.add("active");
    loginForm?.classList.remove("active");
    buttons[1]?.classList.add("active");
  }
}

export async function pageLoader() {
  try {
    const res = await fetch("http://localhost:3000/auth/google/me", {
      credentials: "include",
    });

    if (!res.ok) {
      return;
    }

    const user = await res.json();
    if (!user?.id) return;

    localStorage.setItem("userId", String(user.id));
    const isConversationPage = window.location.pathname === "/conversation_timeline.html";
    login(
      user.first_name || user.username,
      user.username || user.first_name,
      !isConversationPage,
    );
  } catch (err) {
    console.error("Auth check failed");
  }
}