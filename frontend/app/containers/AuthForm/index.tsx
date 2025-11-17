"use client";

import { setCookie } from "cookies-next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import api from "@/services/api";
import { useState } from "react";

export default function AuthForm({ setShowLogin, setShowRegister }: any) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSignIn = () => {
    try {
      if (!formData.email.trim() || !formData.password.trim()) {
        toast.info("Todos os campos são obrigatórios");
        return;
      }

      api
        .post("/auth", {
          email: formData.email,
          password: formData.password,
        })
        .then((res) => {
          if (res.status == 201) {
            localStorage.setItem("__auth", JSON.stringify(res.data));

            // Salva nos cookies (para o middleware)
            setCookie("__auth", JSON.stringify(res.data), {
              maxAge: 60 * 60 * 24 * 7, // expira em 1 semana
              path: "/",
            });
            window.open("/tasks", "_self");
          }
        })
        .catch((error) => {
          const statusCode = error.response.status;
          const statusText = error.response.statusText;

          toast.error("Oops. Problemas ao autenticar", {
            description: `Status: ${statusCode}, Text: ${statusText}`,
          });
        });
    } catch (error: any) {
      console.log(error?.message);
    }
  };

  return (
    <div className="flex flex-col h-screen items-center justify-center select-none">
      <div className="flex flex-col p-8 items-center justify-center rounded-2xl">
        <Card className="p-6">
          <CardTitle>Autenticação WK Test</CardTitle>
          <CardDescription className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                placeholder="Informe seu e-mail"
                type="email"
                value={formData?.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                placeholder="Informe sua senha"
                type="password"
                value={formData?.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          </CardDescription>
          <CardFooter className="flex gap-4 justify-end p-0">
            <Button
              variant={"link"}
              className="cursor-pointer"
              onClick={() => {
                setShowRegister(true);
                setShowLogin(false);
              }}
            >
              Novo usuário
            </Button>
            <Button className="cursor-pointer" onClick={() => handleSignIn()}>
              Acessar
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
