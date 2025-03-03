import { FC } from "react";
import { PuffLoader } from "react-spinners";

interface Props {
  text?: string;
}

const SectionLoading: FC<Props> = ({ text }) => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex items-center space-x-2">
        <PuffLoader />
        <span className="animate-pulse">{text}</span>
      </div>
    </div>
  );
};

export default SectionLoading;
