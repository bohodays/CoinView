"use client";

import React from "react";
import CandleUnitButton from "./CandleUnitButton";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PopoverClose } from "@radix-ui/react-popover";
import { CandleUnit } from "@/entities/candle/model/type";

type Props = {
  candleUnit: CandleUnit;
  onChangeCandleUnit: (candleUnit: CandleUnit) => void;
};

const CandleUnitButtonsWrapper = ({
  candleUnit,
  onChangeCandleUnit,
}: Props) => {
  const minUnits = [1, 3, 5, 10, 15, 30, 60, 240];

  return (
    <div className="flex justify-evenly">
      <CandleUnitButton
        label="초"
        value="seconds"
        onClick={() => onChangeCandleUnit("seconds")}
      />

      <Popover>
        <PopoverTrigger asChild>
          <CandleUnitButton label="분" value="" onClick={() => {}} />
        </PopoverTrigger>
        <PopoverContent>
          <div className="flex">
            {minUnits.map((minUnit, index) => (
              <PopoverClose asChild key={`${index}-${minUnit}`}>
                <div className="hover:bg-muted flex cursor-pointer items-center justify-between p-2">
                  {minUnit}
                </div>
              </PopoverClose>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <CandleUnitButton
        label="일"
        value="days"
        onClick={() => onChangeCandleUnit("days")}
      />

      <CandleUnitButton
        label="주"
        value="weeks"
        onClick={() => onChangeCandleUnit("weeks")}
      />

      <CandleUnitButton
        label="월"
        value="months"
        onClick={() => onChangeCandleUnit("months")}
      />

      <CandleUnitButton
        label="연"
        value="years"
        onClick={() => onChangeCandleUnit("years")}
      />
    </div>
  );
};

export default CandleUnitButtonsWrapper;
