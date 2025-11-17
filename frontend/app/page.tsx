// app/page.tsx - Página de login/cadastro
"use client";

import { useState } from "react";
import AuthForm from "./containers/AuthForm";
import UserRegister from "./containers/UserRegister";

export default function Home() {
  const [showLogin, setShowLogin] = useState(true);
  const [showRegister, setShowRegister] = useState(false);

  if (showLogin) {
    return (
      <AuthForm setShowLogin={setShowLogin} setShowRegister={setShowRegister} />
    );
  }
  if (showRegister) {
    return (
      <UserRegister
        setShowLogin={setShowLogin}
        setShowRegister={setShowRegister}
      />
    );
  }
}
