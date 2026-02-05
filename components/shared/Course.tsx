import FramerMotion from "./FramerMotion";
import { TCourse } from "@/types/models.types";
import ClientCourse from "./ClientCourse";

interface Props {
  course: TCourse;
  withFramerMotionAnimation?: boolean;
  showWishlistHeart?: boolean;
  className?: string;
  children?: React.ReactNode;
  href?: string;
}

const Course = ({
  course,
  withFramerMotionAnimation = true,
  showWishlistHeart = true,
  className,
  children,
  href,
}: Props) => {
  return withFramerMotionAnimation ? (
    <FramerMotion>
      {!children ? (
        <ClientCourse
          course={course}
          showWishlistHeart={showWishlistHeart}
          className={className}
          href={href}
        />
      ) : (
        <ClientCourse
          course={course}
          showWishlistHeart={showWishlistHeart}
          className={className}
          href={href}
        >
          {children}
        </ClientCourse>
      )}
    </FramerMotion>
  ) : (
    <>
      {!children ? (
        <ClientCourse
          course={course}
          showWishlistHeart={showWishlistHeart}
          className={className}
          href={href}
        />
      ) : (
        <ClientCourse
          course={course}
          showWishlistHeart={showWishlistHeart}
          className={className}
          href={href}
        >
          {children}
        </ClientCourse>
      )}
    </>
  );
};

export default Course;
