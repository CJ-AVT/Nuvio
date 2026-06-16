import { FC, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

interface LabelProps {
  htmlFor?: string;
  children: ReactNode;
  className?: string;
  "data-rte-id"?: string;
}

const Label: FC<LabelProps> = ({ htmlFor, children, className, "data-rte-id": dataRteId }) => {
  return (
    <label
      htmlFor={htmlFor}
      data-rte-id={dataRteId}
      className={clsx(
        twMerge(
          "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400",
          className,
        ),
      )}
    >
      {children}
    </label>
  );
};

export default Label;
