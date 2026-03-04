import { Button } from "@/components/ui/button";
import { forwardRef } from "react";

type Props = {
  label: string; // 버튼에 표시될 텍스트 (초, 분, 일 ...)
  value: string; // 버튼이 나타내는 값 (second, minute 등)
  isActive?: boolean; // 현재 선택된 버튼인지
  onClick: (value: string) => void; // 클릭 시 부모 상태 변경
  rightElement?: React.ReactNode; // 분 버튼처럼 추가 UI (ChevronDown, (1) 등)
};

const CandleUnitButton = forwardRef<HTMLButtonElement, Props>(
  ({ label, value, isActive, onClick, rightElement }, ref) => {
    return (
      <Button
        ref={ref}
        type="button"
        className="cursor-pointer"
        onClick={() => onClick(value)}
        variant={isActive ? "default" : "outline"}
      >
        {label}
        {rightElement}
      </Button>
    );
  },
);

export default CandleUnitButton;
