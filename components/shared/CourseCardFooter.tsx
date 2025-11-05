import React from "react";

const CourseCardFooter = ({
  priceOff,
  price,
  isFree,
}: {
  priceOff?: number;
  price: number;
  isFree: boolean;
}) => {
  return (
    <div className="group absolute bottom-0 left-0 w-full border-t border-input flex items-center justify-between p-4">
      <div>
        <div>
          {priceOff ? (
            <div className="flex gap-2">
              {isFree ? (
                <>
                  <s className="text-slate-950 dark:text-slate-200 ">
                    ${price}
                  </s>
                  <span className="text-[#55BE24] font-bold">Free</span>
                </>
              ) : (
                <>
                  <s className="text-slate-950 dark:text-slate-200 ">
                    ${price}
                  </s>
                  <span className="font-bold text-red-500">$ {priceOff}</span>
                </>
              )}
            </div>
          ) : (
            <span className="font-bold text-slate-950 dark:text-slate-200">
              ${price}
            </span>
          )}
        </div>
      </div>
      <p className="text-[15px] text-slate-950 dark:text-slate-200 font-semibold group-hover:text-brand-red-500">
        View More
      </p>
    </div>
  );
};

export default CourseCardFooter;
