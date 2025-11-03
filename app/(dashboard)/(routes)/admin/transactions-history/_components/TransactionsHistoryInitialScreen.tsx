"use client";
import { LeftSideBar } from "@/components/shared";
import NoTransaction from "@/components/shared/animations/NoTransaction";
import TransactionsHistory from "@/components/shared/TransactionsHistory";
import { TUser } from "@/types/models.types";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  instructors: TUser[];
};

const TransactionsHistoryInitialScreen = ({ instructors }: Props) => {
  console.log("instructors", instructors);

  return (
    <div className="flex">
      <LeftSideBar />
      <div className="flex-1 p-6">
        {!instructors.length ? (
          <div className="w-full h-full flex items-center  flex-col gap-y-4">
            <NoTransaction className="md:h-[500px]" />
            <h1 className="fon-bold text-4xl md:text-6xl capitalize">
              No transactions made
            </h1>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {instructors.map((instructor) => (
              <AccordionItem
                key={instructor._id}
                value={`item-${instructor._id}`}
              >
                <AccordionTrigger className="hover:bg-slate-200 dark:hover:bg-slate-900 hover:no-underline px-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-20 border">
                      <AvatarImage src={instructor.picture || "/images/default_profile.avif"} alt="instructor" />
                      <AvatarFallback>
                        <Skeleton className="w-12 h-12 rounded-full" />
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col gap-y-2">
                      <h2 className="font-bold text-lg md:text-xl ">
                        {" "}
                        {instructor.username}{" "}
                      </h2>
                      <p className="text-slate-500 dark:text-slate-400 font-normal">
                        {" "}
                        {
                          instructor.withdrawTransactions!.length
                        } transactions{" "}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <TransactionsHistory
                    transactions={instructor.withdrawTransactions!}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
};

export default TransactionsHistoryInitialScreen;
