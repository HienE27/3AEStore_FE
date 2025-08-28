import React, { useState } from "react";
import { sendActivationCode, activateAccount } from "../api/ActivationAPI";

export function ActivationForm() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSendCode = async () => {
    try {
      setError(null);
      const res = await sendActivationCode(email);
      setMessage(res);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleActivate = async () => {
    try {
      setError(null);
      const res = await activateAccount(email, code);
      setMessage(res);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h3>Gửi mã kích hoạt</h3>
      <input
        type="email"
        placeholder="Nhập email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleSendCode}>Gửi mã kích hoạt</button>

      <h3>Kích hoạt tài khoản</h3>
      <input
        type="text"
        placeholder="Nhập mã kích hoạt"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button onClick={handleActivate}>Kích hoạt</button>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
