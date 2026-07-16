"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BuildingIcon, ClockIcon, SearchCheckIcon, CheckCheckIcon, EllipsisIcon } from "lucide-react";

const menuItems = ["Compartir", "Actualizar", "Refrescar"];

const tabs = [
  {
    name: "Pendientes",
    value: "pendientes",
    icon: <ClockIcon />,
    contentData: [
      { label: "Cash In sin match", value: 420, progress: 65 },
      { label: "Fees por validar", value: 180, progress: 40 },
      { label: "Ajustes contables", value: 95, progress: 25 },
    ],
  },
  {
    name: "En revisión",
    value: "revision",
    icon: <SearchCheckIcon />,
    contentData: [
      { label: "Diferencias en disputa", value: 64, progress: 55 },
      { label: "Excepciones abiertas", value: 37, progress: 30 },
      { label: "Esperando fuente", value: 21, progress: 15 },
    ],
  },
  {
    name: "Conciliadas",
    value: "conciliadas",
    icon: <CheckCheckIcon />,
    contentData: [
      { label: "Cash In conciliado", value: 11820, progress: 98 },
      { label: "Fees validados", value: 3640, progress: 96 },
      { label: "Asientos posteados", value: 2910, progress: 99 },
    ],
  },
];

export const ReconciliationStatusCard = ({ className }: { className?: string }) => {
  return (
    <Card className={className}>
      <CardHeader className="flex justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="size-9.5 rounded-lg after:rounded-[inherit]">
            <AvatarFallback className="bg-primary/10 text-primary rounded-lg text-xs">
              <BuildingIcon className="size-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <span className="text-xl font-medium">dLocal Brasil</span>
            <span className="text-muted-foreground text-sm">Espacio de trabajo</span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon" className="text-muted-foreground size-6 rounded-full" />}
          >
            <EllipsisIcon />
            <span className="sr-only">Menú</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              {menuItems.map((item) => (
                <DropdownMenuItem key={item}>{item}</DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <Separator />
      </CardContent>
      <CardContent className="flex flex-1 flex-col gap-6">
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-medium">12,480</span>
            <span className="text-muted-foreground text-sm">Conciliaciones</span>
          </div>
          <Tabs defaultValue="pendientes" className="flex-1 justify-between gap-6">
            <TabsList className="w-full">
              {tabs.map(({ icon, name, value }) => (
                <TabsTrigger key={value} value={value} className="flex items-center gap-1 px-1.5">
                  {icon}
                  <span className="max-sm:hidden">{name}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {tabs.map((tab) => (
              <TabsContent key={tab.value} value={tab.value} className="flex flex-col justify-evenly gap-6">
                {tab.contentData.map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-base">{item.label}</span>
                      <span className="text-muted-foreground text-sm">{item.value.toLocaleString()}</span>
                    </div>
                    <Progress value={item.progress} className="**:data-[slot=progress-track]:h-2" />
                  </div>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReconciliationStatusCard;
