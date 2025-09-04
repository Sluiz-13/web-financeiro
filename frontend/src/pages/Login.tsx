import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState("");

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setError("");

  try {
    const res = await api.post<{ token: string }>("/auth/login", {
      email: email.trim().toLowerCase(), // <-- importantíssimo
      password,
    });

    login(res.data.token);
    navigate("/");
  } catch (err: any) {
    console.error("Erro no login:", err);

    if (err.response) {
      console.log("Status:", err.response.status);
      console.log("Data:", err.response.data);
    }

    setError("Erro ao fazer login. Verifique suas credenciais.");
  }
};

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Login</h2>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="login-btn">Entrar</button>

          <div className="login-footer">
            Não tem uma conta? <Link to="/register">Cadastre-se</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
