"use client";
interface Props {
  progress: number;
}

const UserProgressBar = ({ progress }: Props) => {
  return (
    // <Progress value={progress} className=" rounded-none w-full bg-input" />
    <div
      className="radial-progress"
      style={{ "--value": 90 }}
      role="progressbar"
    >
      90%
    </div>
  );
};

export default UserProgressBar;
