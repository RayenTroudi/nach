import FramerMotion from "./FramerMotion";
import { TCourse } from "@/types/models.types";
import ClientCourse from "./ClientCourse";

interface Props {
  course: TCourse;
  withFramerMotionAnimation?: boolean;
  showWishlistHeart?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const Course = ({
  course,
  withFramerMotionAnimation = true,
  showWishlistHeart = true,
  className,
  children,
}: Props) => {
  return withFramerMotionAnimation ? (
    <FramerMotion>
      {!children ? (
        <ClientCourse
          course={course}
          showWishlistHeart={showWishlistHeart}
          className={className}
        />
      ) : (
        <ClientCourse
          course={course}
          showWishlistHeart={showWishlistHeart}
          className={className}
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
        />
      ) : (
        <ClientCourse
          course={course}
          showWishlistHeart={showWishlistHeart}
          className={className}
        >
          {children}
        </ClientCourse>
      )}
    </>
  );
};

export default Course;
