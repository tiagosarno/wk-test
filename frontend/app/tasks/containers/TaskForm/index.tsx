"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import api from "@/services/api";
import { toast } from "sonner";

interface TaskSheetProps {
  setRefreshTasks: any;
  idTask: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskForm({
  setRefreshTasks,
  idTask,
  open,
  onOpenChange,
}: TaskSheetProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    completed: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      name: formData.name,
      description: formData.description,
      completed: formData.completed === "1",
    };

    if (idTask && idTask > 0) {
      // update
      api
        .patch(`/tasks/${idTask}`, submitData)
        .then((res) => {
          if (res.status == 200) {
            toast.success("Tarefa atualizada com sucesso");
            setRefreshTasks(true);
          } else {
            console.log(res);
          }
        })
        .catch((res) => {
          const error = res.response.data?.message;
          const errorMessage = error?.message || error;

          let description = "Erro desconhecido";

          if (Array.isArray(errorMessage)) {
            description = errorMessage.join(", ");
          } else if (typeof errorMessage === "string") {
            description = errorMessage;
          }

          toast.error("Oops. Problemas ao atualizar tarefa", {
            description,
          });
        });
    } else {
      // insert
      api
        .post("/tasks", submitData)
        .then((res) => {
          if (res.status == 201) {
            toast.success("Tarefa criada com sucesso");
            setRefreshTasks(true);
          } else {
            console.log(res);
          }
        })
        .catch((res) => {
          const error = res.response.data?.message;
          const errorMessage = error?.message || error;

          let description = "Erro desconhecido";

          if (Array.isArray(errorMessage)) {
            description = errorMessage.join(", ");
          } else if (typeof errorMessage === "string") {
            description = errorMessage;
          }

          toast.error("Oops. Problemas ao gravar tarefa", {
            description,
          });
        });
    }

    // Fecha a sheet
    onOpenChange(false);

    // Limpa o formulário
    setFormData({ name: "", description: "", completed: "" });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    if (idTask && idTask > 0) {
      api.get(`/tasks/${idTask}`).then((res) => {
        setFormData({
          name: res.data.name,
          description: res.data.description,
          completed: res.data.completed ? "1" : "0",
        });
      });
    } else {
      setFormData({ name: "", description: "", completed: "" });
    }
  }, [idTask]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTitle className="sr-only">Tarefa</SheetTitle>
      <SheetContent
        side="right"
        className="w-[80vw] max-w-[80vw]! xl:max-w-[640px]!"
      >
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-6">Tarefa</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-4">
              <Label htmlFor="name">Nome da Tarefa</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Digite o nome da tarefa"
                required
              />
            </div>

            <div className="flex flex-col gap-4">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Digite a descrição"
                required
              />
            </div>

            {idTask && idTask > 0 && (
              <div className="flex flex-col gap-4">
                <Label htmlFor="description">Status da Tarefa</Label>
                <Select
                  value={formData.completed}
                  onValueChange={(value) =>
                    handleInputChange("completed", value)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="1">Concluída</SelectItem>
                      <SelectItem value="0">Pendente</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
