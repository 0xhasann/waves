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
        // alert("Account created successfully!");
        window.location.href = "/";
        console.log(data);
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong");
    }

}
