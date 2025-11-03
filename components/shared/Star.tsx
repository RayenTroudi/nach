import Image from "next/image";
import React from "react";

const Star = ({
  filled,
  stars,
  index,
  size = 20,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: {
  filled: boolean;
  stars: number;
  index: number;
  size?: number;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
}) => {
  const starsAsInteger = Math.floor(stars);
  const isInteger = Number.isInteger(stars);

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      className="cursor-pointer transition-all ease-in-out duration-300"
    >
      {filled ? (
        starsAsInteger === index && !isInteger ? (
          <Image
            src="/icons/half-star.svg"
            alt="filled"
            width={size}
            height={size}
          />
        ) : (
          <Image
            src="/icons/star-solid.svg"
            fill={false}
            alt="filled"
            width={size}
            height={size}
          />
        )
      ) : (
        <Image
          src="/icons/star-outline.svg"
          alt="filled"
          width={size}
          height={size}
        />
      )}
    </div>
  );
};

export default Star;
