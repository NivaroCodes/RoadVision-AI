import { createFileRoute } from "@tanstack/react-router";
import { Check, Minus } from "lucide-react";
import { DashboardShell, PanelHeader } from "@/components/roadvision/DashboardShell";
import { navItems } from "@/components/roadvision/Sidebar";
import { roleLabel, type Role } from "@/lib/session";

export const Route = createFileRoute("/access")({
  head: () => ({
    meta: [
      { title: "Права доступа — Qala Vision" },
      {
        name: "description",
        content: "Матрица прав доступа по ролям: администратор, дорожная служба, житель.",
      },
      { property: "og:title", content: "Права доступа — Qala Vision" },
      { property: "og:description", content: "Матрица доступа к разделам платформы." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AccessPage,
});

const roles: Role[] = ["admin", "road", "resident"];

function AccessPage() {
  return (
    <DashboardShell title="Права доступа" subtitle="Матрица доступа к разделам по ролям">
      <section className="panel overflow-hidden">
        <PanelHeader title="Роли и разделы" meta={`${navItems.length} разделов`} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-2.5 text-left text-eyebrow">Раздел</th>
                {roles.map((r) => (
                  <th key={r} className="px-5 py-2.5 text-left text-eyebrow">
                    {roleLabel[r]}
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
                    const allowed = (item.roles as readonly Role[]).includes(r);
                    return (
                      <td key={r} className="px-5 py-3.5">
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
    </DashboardShell>
  );
}
