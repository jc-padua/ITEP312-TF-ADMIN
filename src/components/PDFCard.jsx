import React from "react";
import YDALOGO from "./img/ydao.png";
import { Typography, Image } from "@material-tailwind/react";

function PDFCard() {
  const Header = () => {
    <div className="flex items-center justify-between">
      <Image src={YDALOGO} />
      <Typography>YDA Report</Typography>
      <Typography>{new Date().toLocaleDateString()}</Typography>
    </div>;
  };

  return <div></div>;
}

export default PDFCard;
