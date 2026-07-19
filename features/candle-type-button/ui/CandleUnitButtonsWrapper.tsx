"use client";

import React from "react";
import CandleUnitButton from "./CandleUnitButton";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui";
import { PopoverClose } from "@radix-ui/react-popover";
import { CandleUnit, MinutesUnit } from "@/entities/candle";
import { cn } from "@/shared/lib";

type Props = {
  candleUnit: CandleUnit;
  minutesUnit: MinutesUnit;
  onChangeCandleUnit: (candleUnit: CandleUnit) => void;
  onChangeMinutesUnit: (minuteUnit: MinutesUnit) => void;
};

const CandleUnitButtonsWrapper = ({
  candleUnit,
  minutesUnit,
  onChangeCandleUnit,
  onChangeMinutesUnit,
}: Props) => {
  const minUnits: MinutesUnit[] = [
    "1",
    "3",
    "5",
    "10",
    "15",
    "30",
    "60",
    "240",
  ];

  const onClickMinuteUnit = (minuteUnit: MinutesUnit) => {
    onChangeCandleUnit("minutes");
    onChangeMinutesUnit(minuteUnit);
  };

  return (
    <div className="flex justify-evenly">
      <CandleUnitButton
        label="초"
        value="seconds"
        isActive={candleUnit === "seconds"}
        onClick={() => onChangeCandleUnit("seconds")}
      />

      <Popover>
        <PopoverTrigger asChild>
          <CandleUnitButton
            label="분"
            value=""
            isActive={candleUnit === "minutes"}
            onClick={() => {}}
          />
        </PopoverTrigger>
        <PopoverContent>
          <div className="flex">
            {minUnits.map((minUnit, index) => {
              const isMinuteActive =
                candleUnit === "minutes" && minutesUnit === minUnit;

              return (
                <PopoverClose asChild key={`${index}-${minUnit}`}>
                  <button
                    type="button"
                    aria-pressed={isMinuteActive}
                    className={cn(
                      "hover:bg-muted flex cursor-pointer items-center justify-between p-2",
                      isMinuteActive && "bg-muted font-semibold",
                    )}
                    onClick={() => onClickMinuteUnit(minUnit)}
                  >
                    {minUnit}
                  </button>
                </PopoverClose>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      <CandleUnitButton
        label="일"
        value="days"
        isActive={candleUnit === "days"}
        onClick={() => onChangeCandleUnit("days")}
      />

      <CandleUnitButton
        label="주"
        value="weeks"
        isActive={candleUnit === "weeks"}
        onClick={() => onChangeCandleUnit("weeks")}
      />

      <CandleUnitButton
        label="월"
        value="months"
        isActive={candleUnit === "months"}
        onClick={() => onChangeCandleUnit("months")}
      />

      <CandleUnitButton
        label="연"
        value="years"
        isActive={candleUnit === "years"}
        onClick={() => onChangeCandleUnit("years")}
      />
    </div>
  );
};

export default CandleUnitButtonsWrapper;
