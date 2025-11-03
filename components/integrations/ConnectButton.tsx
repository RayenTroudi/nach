import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

type Props = {
  buttonTitle: string;
  icon: LucideIcon;
  buttonClassName?: string;
  disabled?: boolean;
  isConnected?: boolean;
  onClick?: () => void;
};

const ConnectButton = ({
  buttonTitle,
  icon: Icon,
  buttonClassName,
  disabled = false,
  isConnected = false,
  onClick,
}: Props) => {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={cn("p-[1px] relative hidden md:block", buttonClassName)}
    >
      {!isConnected ? (
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500  rounded-md" />
      ) : null}
      <div className="px-4 py-2 flex items-center justify-center gap-2 bg-white rounded-md hover:text-white dark:bg-slate-900   relative group transition duration-200  hover:bg-transparent hover:dark:bg-transparent ">
        <Icon size={20} className=" " />
        <span className="">{buttonTitle}</span>
      </div>
    </button>
  );
};

export default ConnectButton;
