"use client";
import React, { useState } from "react";

const ShowMoreLess = ({ text }: { text: string }) => {
  const [show, setShow] = useState<boolean>(false);
  console.log(text.length);
  return (
    <div className="flex flex-col gap-2 break-words	">
      {text?.length < 100 ? (
        <p className="text-[14px]    text-slate-950 dark:text-slate-200 	">
          {text}
        </p>
      ) : (
        <>
          <p className="text-[14px]  text-slate-950 dark:text-slate-200 ">
            {show ? text : <>{text.slice(0, 100)}...</>}
          </p>
          <div className="w-full flex justify-end">
            <div
              onClick={() => setShow((curr) => !curr)}
              className="cursor-pointer text-slate-950 dark:text-slate-200 text-[13px] font-semibold hover:text-[#FF782D] dark:hover:text-[#FF782D] bg-transparent hover:bg-transparent hover:underline underline-offset-2 duration-300 ease-in-out"
            >
              {show ? "Show less" : "Show more"}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ShowMoreLess;
