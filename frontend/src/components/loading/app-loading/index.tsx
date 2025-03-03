import { FC } from "react";
import SectionLoading from "../section-loading";

interface Props {
  text?: string;
}

const AppLoading: FC<Props> = ({ text }) => {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <SectionLoading text={text} />
    </div>
  );
};

export default AppLoading;
