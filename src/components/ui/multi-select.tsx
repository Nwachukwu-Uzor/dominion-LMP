import * as React from "react";
import { cn } from "@/lib/utils";

import { HiChevronUpDown, HiCheck, HiXMark } from "react-icons/hi2";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { capitalize } from "@/utils";

export type OptionType = {
  label: string;
  value: string;
};

interface MultiSelectProps {
  options: OptionType[];
  selected: string[];
  onChange: React.Dispatch<React.SetStateAction<string[]>>;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

function MultiSelect({
  options,
  selected,
  onChange,
  placeholder,
  ...props
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleUnselect = (item: string) => {
    onChange(selected.filter((i) => i !== item));
  };

  return (
    <div className="relative w-full" id="pop_over_parent_2223">
      <Popover open={open} onOpenChange={setOpen} {...props} modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={`w-full justify-between ${
              selected.length > 1 ? "h-full" : "h-10"
            }`}
            onClick={() => setOpen(!open)}
          >
            {selected?.length === 0 ? (
              placeholder ?? "Please make a selection..."
            ) : (
              <div className="flex gap-1 flex-wrap">
                {selected?.map((item) => (
                  <Badge
                    variant="secondary"
                    key={item}
                    className="mr-1 mb-1"
                    onClick={() => handleUnselect(item)}
                  >
                    {capitalize(item)}
                    <button
                      className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleUnselect(item);
                        }
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={() => handleUnselect(item)}
                    >
                      <HiXMark className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <HiChevronUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="border-2 left-0 w-[var(--radix-popover-trigger-width)] z-50"
        >
          <div className="flex flex-col w-full max-h-[30vh] overflow-y-scroll">
            {options.map((option) => (
              <button
                className="w-full flex justify-between items-center text-sm whitespace-nowrap"
                key={option.value}
                onClick={() => {
                  onChange(
                    selected?.includes(option.value)
                      ? selected.filter((item) => item !== option.value)
                      : [...selected, option.value]
                  );
                  setOpen(true);
                }}
              >
                <span>{option.label} </span>
                <HiCheck
                  className={cn(
                    "mr-2 h-4 w-4 inline-block",
                    selected.includes(option.value)
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export { MultiSelect };
