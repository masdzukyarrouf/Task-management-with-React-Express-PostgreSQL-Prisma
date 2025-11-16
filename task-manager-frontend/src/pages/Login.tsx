import { useState } from "react";
import api from "../api/axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e: any) => {
    e.preventDefault();
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    window.location.href = "/";
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <input placeholder="email" onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="password" type="password" onChange={(e) => setPassword(e.target.value)} />
        <button>Login</button>
      </form>
    </div>
  );
}
