import { cn } from "@/shared/lib/utils";
import { MarketEvent } from "@/widgets/coin-list/model/types";
import React from "react";

const WarningCautionTag = ({ type }: { type: "WARN" | "CAUT" }) => {
  const bgType = type === "WARN" ? "bg-red-500" : "bg-orange-500";

  return (
    <div
      className={cn(
        "rounded-xs text-xs flex justify-center items-center h-fit text-white p-[0.5] w-4 h-fit",
        bgType,
      )}
    >
      <div>{type === "WARN" ? "유" : "경"}</div>
    </div>
  );
};

export default WarningCautionTag;
