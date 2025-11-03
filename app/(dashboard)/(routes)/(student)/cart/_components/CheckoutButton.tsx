import MultiPurchaseDialog from "./MultiPurchaseDialog";
import { TCourse } from "@/types/models.types";

interface CheckoutButtonProps {
  courses: TCourse[];
}

const CheckoutButton: React.FC<CheckoutButtonProps> = ({ courses }) => {
  return (
    <MultiPurchaseDialog
      courses={courses}
      triggerButtonClassName="w-full bg-slate-950 dark:bg-slate-200 dark:hover:opacity-90 transition-all duration-300 ease-in-out mt-2 rounded-sm text-md font-bold"
    />
  );
};

export default CheckoutButton;
