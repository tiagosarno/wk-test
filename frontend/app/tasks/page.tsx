"use client";

import { useEffect, useState, useMemo } from "react";
import api from "@/services/api";

import { formatDateTime } from "@/utils/dateFormater";
import { Button } from "@/components/ui/button";
import { TaskForm } from "@/app/tasks/containers/TaskForm";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { Edit, Trash } from "lucide-react";
import { toast } from "sonner";

export default function TasksPage() {
  const [taskData, setTaskData] = useState([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [idTask, setIdTask] = useState(null);
  const [refreshTasks, setRefreshTasks] = useState(false);
  const [selectedFilterValue, setSelectedFilterValue] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  // Qtde. itens por página
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const TASK_FILTERS = {
    TODAS_TAREFAS: "T",
    CONCLUIDAS: "1",
    PENDENTES: "0",
  };

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return taskData.slice(startIndex, endIndex);
  }, [taskData, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(taskData.length / itemsPerPage);
  }, [taskData, itemsPerPage]);

  const getVisiblePages = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Ajustar se estiver no início
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const handleDeleteTask = (idTask: number): void => {
    api.delete(`/tasks/${idTask}`).then((res) => {
      if (res.status == 200) {
        toast.info("Task removida com sucesso");
        setRefreshTasks(true);
        // Reset para primeira página após deletar, se necessário
        setCurrentPage(1);
      } else {
        toast.error("Problemas ao deletar a Task");
      }
    });
  };

  const handleFilterChange = (value: string) => {
    setSelectedFilterValue(value);
    setCurrentPage(1); // Reset para primeira página ao mudar filtro

    if (value == TASK_FILTERS.TODAS_TAREFAS) {
      api.get("/tasks").then((res) => {
        setTaskData(res.data);
      });
    }
    if (value == TASK_FILTERS.CONCLUIDAS) {
      api.get(`/tasks/filter/${TASK_FILTERS.CONCLUIDAS}`).then((res) => {
        setTaskData(res.data);
      });
    }
    if (value == TASK_FILTERS.PENDENTES) {
      api.get(`/tasks/filter/${TASK_FILTERS.PENDENTES}`).then((res) => {
        setTaskData(res.data);
      });
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    api.get("/tasks").then((res) => {
      setTaskData(res.data);
      setCurrentPage(1); // Reset para primeira página ao carregar dados
    });
  }, []);

  useEffect(() => {
    if (refreshTasks === true) {
      api.get("/tasks").then((res) => {
        setTaskData(res.data);
        setIdTask(null);
        setRefreshTasks(false);
        setCurrentPage(1); // Reset para primeira página ao atualizar
      });
    }
  }, [refreshTasks]);

  return (
    <div className="p-0 m-0 flex flex-col h-screen">
      <div className="flex flex-col h-screen select-none">
        <div className="p-4">
          <div className="flex justify-between">
            <Select
              value={selectedFilterValue}
              onValueChange={handleFilterChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtro de Tarefas" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  <SelectItem value="T">Todas</SelectItem>
                  <SelectItem value="1">Concluídas</SelectItem>
                  <SelectItem value="0">Pendentes</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button
              className="cursor-pointer"
              onClick={() => {
                setIdTask(null);
                setIsSheetOpen(true);
              }}
            >
              Nova Tarefa
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-4">
          <Table className="w-full">
            <TableCaption>Lista de Tarefas</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Ações</TableHead>
                <TableHead className="min-w-[200px]">Tarefa</TableHead>
                <TableHead className="min-w-[300px]">Descrição</TableHead>
                <TableHead className="min-w-[120px]">Status</TableHead>
                <TableHead className="min-w-[180px]">Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    nenhuma tarefa até o momento
                  </TableCell>
                </TableRow>
              )}
              {paginatedData.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="flex gap-2">
                    <Button
                      size="icon"
                      onClick={() => {
                        setIdTask(p.id);
                        setIsSheetOpen(true);
                      }}
                    >
                      <Edit />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon">
                          <Trash />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Aviso</AlertDialogTitle>
                          <AlertDialogDescription>
                            Deseja realmente remover este registro?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              handleDeleteTask(p.id);
                            }}
                          >
                            Confirmar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {p.description}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        p.completed
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {p.completed ? "Concluída" : "Pendente"}
                    </span>
                  </TableCell>
                  <TableCell>{formatDateTime(p.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(currentPage - 1);
                          }}
                          className={
                            currentPage === 1
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>

                      {getVisiblePages()[0] > 1 && (
                        <>
                          <PaginationItem>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(1);
                              }}
                            >
                              1
                            </PaginationLink>
                          </PaginationItem>
                          {getVisiblePages()[0] > 2 && (
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                          )}
                        </>
                      )}

                      {getVisiblePages().map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(page);
                            }}
                            isActive={page === currentPage}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                      {getVisiblePages()[getVisiblePages().length - 1] <
                        totalPages && (
                        <>
                          {getVisiblePages()[getVisiblePages().length - 1] <
                            totalPages - 1 && (
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                          )}
                          <PaginationItem>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(totalPages);
                              }}
                            >
                              {totalPages}
                            </PaginationLink>
                          </PaginationItem>
                        </>
                      )}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(currentPage + 1);
                          }}
                          className={
                            currentPage === totalPages
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>

                  <div className="mt-2 text-sm text-gray-600">
                    Exibindo de {(currentPage - 1) * itemsPerPage + 1} a{" "}
                    {Math.min(currentPage * itemsPerPage, taskData.length)} de{" "}
                    {taskData.length} Tarefas
                  </div>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>
      <TaskForm
        setRefreshTasks={setRefreshTasks}
        idTask={idTask}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />
    </div>
  );
}
