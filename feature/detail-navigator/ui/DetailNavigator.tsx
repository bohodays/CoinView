import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import React from "react";

const DetailNavigator = () => {
  return (
    <div className="flex gap-2">
      <Link href={"/"}>
        <ChevronLeft className="size-6 cursor-pointer" />
      </Link>
      <div>비트코인</div>
    </div>
  );
};

export default DetailNavigator;
