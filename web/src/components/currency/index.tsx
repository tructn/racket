import React from "react";
import formatter from "../../common/formatter";

interface Props {
  value?: number;
}

const Currency: React.FC<Props> = ({ value }) => {
  return value ? <span>{formatter.currency(value)}</span> : <span>-</span>;
};

export default Currency;
