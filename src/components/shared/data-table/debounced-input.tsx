import React from "react";

interface Props
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
}

export const DebouncedInput: React.FC<Props> = ({
  value: initialValue,
  onChange,
  debounce = 200,
  ...props
}) => {
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value, debounce]);

  return (
    <input
      id="search"
      name="search"
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="p-1.5 rounded-sm border border-gray-400 focus:border-primary focus:outline-none w-full max-w-[300px]"
    />
  );
};
