import { useState } from "react";
import api from "../api/axios";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e: any) => {
    e.preventDefault();
    await api.post("/auth/register", { email, password });
    window.location.href = "/login";
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={submit}>
        <input placeholder="email" onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="password" type="password" onChange={(e) => setPassword(e.target.value)} />
        <button>Register</button>
      </form>
    </div>
  );
}
