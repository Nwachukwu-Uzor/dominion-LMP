import React from "react";
import Select, {
  ActionMeta,
  OnChangeValue,
  Props as SelectProps,
} from "react-select";
import { ReactSelectOptionType } from "@/types/shared";

type StringOrReactElement = string | React.ReactNode;

type Props<T = string> = Omit<
  SelectProps<ReactSelectOptionType<T>, false>,
  "onChange"
> & {
  label?: StringOrReactElement;
  error?: StringOrReactElement;
  onChange?: (
    newValue: OnChangeValue<ReactSelectOptionType<T>, false>,
    actionMeta: ActionMeta<ReactSelectOptionType<T>>,
  ) => void;
};

export const ReactSelectCustomized: React.FC<Props> = ({
  label,
  error,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={props.id}
          className="cursor-pointer text-sm font-medium text-gray-800"
        >
          {label}
        </label>
      )}
      <Select
        maxMenuHeight={200}
        styles={{
          control: (base, state) => ({
            ...base,
            boxShadow: state.isFocused ? "0 0 0 0.5px #7e22ce" : "none",
            backgroundColor: "transparent",
            border: state.isFocused ? "none" : "1px solid #e2e8f0",
            outline: "none",
            // borderColor: state.isFocused ? "#7e22ce" : "#e2e8f0",
            "&:hover": {
              borderColor: state.isFocused ? "#7e22ce" : "#e2e8f0",
            },
            paddingBlock: "1px",
            height: "2.15rem",
            minHeight: "2.15rem",
            fontSize: "14px"
          }),
          option: (styles, { isSelected }) => ({
            ...styles,
            backgroundColor: isSelected ? "#984ed8" : "#fff",
            color: isSelected ? "#fff" : "#000",
            ":active": {
              backgroundColor: "#984ed8",
              color: "#fff",
            },
            ":hover": {
              color: isSelected ? "gray" : "black",
              backgroundColor: isSelected ? "#984ed8" : "#f2e9fa",
            },
          }),
          menu: (base) => ({
            ...base,
            zIndex: 9999999,
          }),
          input: (provided) => ({
            ...provided,
            margin: 0
          })
        }}
        {...props}
      />
      {error && <p className="mt-0.5 h-1 text-[10px] text-red-500">{error}</p>}
    </div>
  );
};
