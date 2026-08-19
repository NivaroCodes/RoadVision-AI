import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#16181d] group-[.toaster]:text-[#f4f4f5] group-[.toaster]:border-2 group-[.toaster]:border-[#9bef18]/60 group-[.toaster]:shadow-[0_0_25px_rgba(155,239,24,0.18)] rounded-xl p-4 font-sans text-[13.5px]",
          title: "font-bold text-[#9bef18] text-[14.5px] leading-tight mb-1",
          description: "text-[#e4e4e7] text-[12.5px] font-medium leading-relaxed",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
