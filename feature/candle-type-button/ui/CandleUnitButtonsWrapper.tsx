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

const CandleUnitButtonsWrapper = () => {
  return (
    <div className="flex justify-evenly">
      <CandleUnitButton label="초" value="" onClick={() => {}} />

      <Popover>
        <PopoverTrigger asChild>
          <CandleUnitButton label="분" value="" onClick={() => {}} />
        </PopoverTrigger>
        <PopoverContent>
          <div className="flex">
            <PopoverClose asChild>
              <div className="hover:bg-muted flex cursor-pointer items-center justify-between p-2">
                1
              </div>
            </PopoverClose>
            <PopoverClose asChild>
              <div className="hover:bg-muted flex cursor-pointer items-center justify-between p-2">
                3
              </div>
            </PopoverClose>
            <PopoverClose asChild>
              <div className="hover:bg-muted flex cursor-pointer items-center justify-between p-2">
                5
              </div>
            </PopoverClose>
            <PopoverClose asChild>
              <div className="hover:bg-muted flex cursor-pointer items-center justify-between p-2">
                10
              </div>
            </PopoverClose>
            <PopoverClose asChild>
              <div className="hover:bg-muted flex cursor-pointer items-center justify-between p-2">
                15
              </div>
            </PopoverClose>
            <PopoverClose asChild>
              <div className="hover:bg-muted flex cursor-pointer items-center justify-between p-2">
                30
              </div>
            </PopoverClose>
            <PopoverClose asChild>
              <div className="hover:bg-muted flex cursor-pointer items-center justify-between p-2">
                60
              </div>
            </PopoverClose>
            <PopoverClose asChild>
              <div className="hover:bg-muted flex cursor-pointer items-center justify-between p-2">
                240
              </div>
            </PopoverClose>
          </div>
        </PopoverContent>
      </Popover>

      <CandleUnitButton label="일" value="" onClick={() => {}} />

      <CandleUnitButton label="주" value="" onClick={() => {}} />

      <CandleUnitButton label="월" value="" onClick={() => {}} />

      <CandleUnitButton label="연" value="" onClick={() => {}} />
    </div>
  );
};

export default CandleUnitButtonsWrapper;
