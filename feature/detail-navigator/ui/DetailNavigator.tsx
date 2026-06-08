import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import React from "react";

const DetailNavigator = ({ marketName }: { marketName: string }) => {
  return (
    <div className="flex gap-2 items-center">
      <Link href={"/"}>
        <ChevronLeft className="size-6 cursor-pointer" />
      </Link>
      <div>{marketName}</div>
    </div>
  );
};

export default DetailNavigator;
