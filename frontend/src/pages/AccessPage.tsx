import { Check, Minus } from "lucide-react";
import { PanelHeader } from "@/components/layout/PanelHeader";
import { navItems } from "@/components/layout/Sidebar";

const roles = [
  { key: "admin", label: "Администратор" },
  { key: "road_service", label: "Дорожная служба" },
  { key: "resident", label: "Житель" },
] as const;

export default function AccessPage() {
  return (
    <div className="space-y-4 md:space-y-5">
      <section className="panel overflow-hidden">
        <PanelHeader title="Роли и разделы" meta={`${navItems.length} разделов`} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-2.5 text-left text-eyebrow">Раздел</th>
                {roles.map((r) => (
                  <th key={r.key} className="px-5 py-2.5 text-left text-eyebrow">
                    {r.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {navItems.map((item) => (
                <tr key={item.to}>
                  <td className="px-5 py-3.5 text-[13px] font-medium text-foreground">
                    {item.label}
                  </td>
                  {roles.map((r) => {
                    const allowed = (item.roles as readonly string[]).includes(r.key);
                    return (
                      <td key={r.key} className="px-5 py-3.5">
                        {allowed ? (
                          <Check className="size-4 text-primary" />
                        ) : (
                          <Minus className="size-4 text-muted-foreground/60" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
