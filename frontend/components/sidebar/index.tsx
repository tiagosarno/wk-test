"use client";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "../ui/button";
import { AppWindow, ClipboardList, LogOut, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Label } from "@radix-ui/react-label";

export function Sidebar() {
  const router = useRouter();

  return (
    <div className="flex flex-col bg-muted/40">
      {/*Desktop version*/}
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-40 border-r bg-background sm:flex">
        <nav className="flex flex-col gap-4 px-2 py-5">
          <div
            className="flex gap-2 items-center cursor-pointer"
            onClick={() => {
              router.push("/tasks");
            }}
          >
            <Button size="icon" variant="outline" className="cursor-pointer">
              <ClipboardList className="w-5 h-5" />
            </Button>
            <span className="text-primary/40">Tarefas</span>
          </div>
          <div
            className="flex gap-2 items-center cursor-pointer"
            onClick={() => {
              router.push("/tasks");
            }}
          >
            <Button
              id="sair"
              size="icon"
              variant="outline"
              className="cursor-pointer"
              onClick={() => {
                localStorage.removeItem("__auth");
                toast.info("Realizando logout..");
                setTimeout(() => {
                  router.push("/");
                }, 2000);
              }}
            >
              <LogOut className="w-5 h-5" />
            </Button>
            <Label htmlFor="sair" className="text-primary/40 cursor-pointer">
              Sair
            </Label>
          </div>
        </nav>
      </aside>

      {/*Mobile version*/}
      <div className="sm:hidden flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center px-4 border-b bg-background gap-4 sm:static sm:h-auto sm:border:0 sm:bg-transparent sm:px-6">
          <Button
            size="icon"
            variant="outline"
            className="sm:hidden"
            onClick={() => {
              router.push("/tasks");
            }}
          >
            <ClipboardList className="w-5 h-5" />
            <span className="sr-only">Tarefas</span>
          </Button>
          <h2 className="text-primary/40">Tarefas</h2>
          <Button
            size="icon"
            variant="outline"
            className="sm:hidden"
            onClick={() => {
              localStorage.removeItem("__auth");
              toast.info("Realizando logout..");
              setTimeout(() => {
                router.push("/");
              }, 1500);
            }}
          >
            <LogOut className="w-5 h-5" />
            <span className="sr-only">Sair</span>
          </Button>
          <h2 className="text-primary/40">Sair</h2>
        </header>
      </div>
    </div>
  );
}
