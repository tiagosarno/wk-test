"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import api from "@/services/api";
import { useState } from "react";

interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  confirmPassword: string;
}

interface UserRegisterProps {
  setShowLogin: (show: boolean) => void;
  setShowRegister: (show: boolean) => void;
}

export default function UserRegister({
  setShowLogin,
  setShowRegister,
}: UserRegisterProps) {
  const [data, setData] = useState<IUser>({
    name: "",
    email: "",
    passwordHash: "",
    confirmPassword: "",
  });

  const handleRegister = () => {
    try {
      if (
        !data.name.trim() ||
        !data.email.trim() ||
        !data.passwordHash.trim()
      ) {
        toast.info("Todos os campos são obrigatórios");
        return;
      }

      if (data.passwordHash !== data.confirmPassword) {
        toast.error("As senhas não coincidem");
        return;
      }

      if (!data.email.includes("@")) {
        toast.error("Por favor, insira um email válido");
        return;
      }

      api
        .post("/users", {
          name: data.name,
          email: data.email,
          passwordHash: data.passwordHash,
        })
        .then((res) => {
          if (res.status == 400) {
          }
          if (res.data) {
            toast.success("Usuário registrado com sucesso. Redirecionando..");
            setData({
              name: "",
              email: "",
              passwordHash: "",
              confirmPassword: "",
            });
            setTimeout(() => {
              setShowRegister(false);
              setShowLogin(true);
            }, 1500);
          }
        })
        .catch((res) => {
          const error = res.response.data?.message;
          toast.error(
            `Oops, requisição falhou com status ${error.statusCode}`,
            {
              description: error.message,
            }
          );
        });
    } catch (error: any) {
      toast.error(error);
    }
  };

  return (
    <div className="flex flex-col h-screen items-center justify-center select-none">
      <div className="flex flex-col p-8 items-center justify-center rounded-2xl">
        <Card className="p-6">
          <CardTitle>Novo Usuário WK Test</CardTitle>
          <CardDescription className="flex flex-col gap-4">
            <p>
              <label>Nome completo</label>
              <Input
                placeholder="Informe seu nome"
                onChange={(e) => {
                  setData({ ...data, name: e.target.value });
                }}
                value={data.name}
              />
            </p>
            <p>
              <label>E-mail</label>
              <Input
                placeholder="Informe seu e-mail"
                type="email"
                onChange={(e) => {
                  setData({ ...data, email: e.target.value });
                }}
                value={data.email}
              />
            </p>
            <p>
              <label>Senha</label>
              <Input
                placeholder="Informe sua senha"
                type="password"
                onChange={(e) => {
                  setData({ ...data, passwordHash: e.target.value });
                }}
                value={data.passwordHash}
              />
            </p>
            <p>
              <label>Confirmação de Senha</label>
              <Input
                placeholder="Confirme sua senha"
                type="password"
                value={data.confirmPassword}
                onChange={(e) => {
                  setData({ ...data, confirmPassword: e.target.value });
                }}
              />
            </p>
          </CardDescription>
          <CardFooter className="flex gap-4 justify-end p-0">
            <Button
              variant={"link"}
              className="cursor-pointer"
              onClick={() => {
                setShowRegister(false);
                setShowLogin(true);
              }}
            >
              Cancelar
            </Button>
            <Button
              className="cursor-pointer"
              onClick={() => {
                handleRegister();
              }}
            >
              Gravar
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
