import {AlertTriangle, CheckCircle} from "lucide-react";
import {cva, type VariantProps} from "class-variance-authority";
import {cn} from "@/lib/utils";
import React from "react";

const bannerVariants = cva(
  `border text-center p-4 text-sm  flex items-center w-full`,
  {
    variants: {
      variant: {
        warning: "bg-yellow-200/80 border-yellow-30 text-primary",
        sucess: "bg-emerald-700 border-emerald-800 text-secondary",
      },
    },
    defaultVariants: {
      variant: "warning",
    },
  }
);
interface Props extends VariantProps<typeof bannerVariants> {
  label: string;
}

const iconMap = {
  warning: AlertTriangle,
  sucess: CheckCircle,
};

function Banner({label, variant}: Props) {
  const Icon = iconMap[variant || "warning"];

  return (
    <div className={cn(bannerVariants({variant}))}>
      <Icon className="mr-2 h-4 w-5" />
      {label}
    </div>
  );
}

export default Banner;
