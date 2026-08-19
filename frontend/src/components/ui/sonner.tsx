import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      position="bottom-right"
      toastOptions={{
        style: {
          background: "#16181d",
          border: "2px solid rgba(155, 239, 24, 0.55)",
          boxShadow: "0 0 28px rgba(155, 239, 24, 0.15), 0 8px 32px rgba(0,0,0,0.6)",
          borderRadius: "14px",
          padding: "14px 16px",
          color: "#f4f4f5",
          fontFamily: "var(--font-sans)",
          fontSize: "13.5px",
        },
        classNames: {
          title: "!text-[#9bef18] !font-bold !text-[14px] !leading-tight",
          description: "!text-[#d4d4d8] !text-[12.5px] !font-medium !leading-relaxed !mt-0.5",
          actionButton: "!bg-primary !text-primary-foreground",
          cancelButton: "!bg-muted !text-muted-foreground",
          closeButton: "!bg-surface !text-muted-foreground !border-border hover:!text-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
