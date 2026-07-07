import { Link } from "@tanstack/react-router";
import { CalendarCheck, Home, LogOut } from "lucide-react";

export function Dock() {
  return (
    <div className="fixed inset-x-0 bottom-5 z-40 flex justify-center">
      <nav className="flex items-center gap-1 rounded-full border border-border bg-card/70 p-1.5 shadow-lg backdrop-blur-xl">
        <DockItem to="/dashboard" icon={Home} label="Início" />
        <DockItem to="/checkin" icon={CalendarCheck} label="Check-in" />
        <DockItem to="/" icon={LogOut} label="Sair" />
      </nav>
    </div>
  );
}

function DockItem({ to, icon: Icon, label }: { to: string; icon: typeof Home; label: string }) {
  return (
    <Link
      to={to}
      aria-label={label}
      activeOptions={{ exact: true }}
      activeProps={{ className: "bg-primary text-primary-foreground" }}
      className="grid h-11 w-11 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      <Icon className="h-5 w-5" />
    </Link>
  );
}
