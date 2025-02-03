"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useVirtualizer } from "@tanstack/react-virtual";

interface VirtualizedComboboxProps {
  options: {
    label: string;
    value: string;
  }[];
  value: string;
  onSelect: (val: string) => void;
}

export function VirtualizedCombobox({
  options,
  value,
  onSelect,
}: VirtualizedComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  // Filter the items based on the search input.
  const filteredItems = React.useMemo(() => {
    if (!search) return options;
    return options.filter((framework) =>
      framework.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  // Ref for the scrollable container.
  const parentRef = React.useRef<HTMLDivElement>(null);
  // Ref for the CommandInput.
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Set up the virtualizer.
  const rowVirtualizer = useVirtualizer({
    count: filteredItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40, // Estimate each item’s height (adjust as needed)
    overscan: 5,
  });

  // When the popover opens, use a setTimeout(…, 0) to ensure that
  // the container is rendered and measured.
  React.useEffect(() => {
    if (open) {
      setTimeout(() => {
        rowVirtualizer.measure();
      }, 0);
    }
  }, [open, rowVirtualizer]);

  // Handler for arrow key events on the input.
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      // Delay to allow the Command component to update the highlighted item.
      setTimeout(() => {
        if (!parentRef.current) return;

        // Try to locate the active/highlighted item.
        let activeItem = parentRef.current.querySelector(
          '[aria-selected="true"]'
        ) as HTMLElement | null;

        // Some implementations may use a CSS class instead.
        if (!activeItem) {
          activeItem = parentRef.current.querySelector(
            ".active"
          ) as HTMLElement | null;
        }

        if (activeItem && activeItem.dataset.index) {
          const index = parseInt(activeItem.dataset.index, 10);
          rowVirtualizer.scrollToIndex(index, { align: "center" });
        }
      }, 0);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? options.find((fw) => fw.value === value)?.label
            : "Select option..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            ref={inputRef}
            placeholder="Search option..."
            value={search}
            onValueChange={(value) => setSearch(value)}
            onKeyDown={handleInputKeyDown}
          />
          <CommandList>
            {filteredItems.length === 0 ? (
              <CommandEmpty>No option found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {/* Container for the virtualized list */}
                <div
                  ref={parentRef}
                  className="relative h-60 overflow-auto"
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  {/* Inner container with total height */}
                  <div
                    style={{
                      height: `${rowVirtualizer.getTotalSize()}px`,
                      width: "100%",
                      position: "relative",
                    }}
                  >
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                      const item = filteredItems[virtualRow.index];
                      return (
                        <div
                          key={item.value}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            transform: `translateY(${virtualRow.start}px)`,
                          }}
                          // Attach the index so we can scroll to it.
                          data-index={virtualRow.index}
                        >
                          <CommandItem
                            value={item.value}
                            onFocus={() =>
                              rowVirtualizer.scrollToIndex(virtualRow.index, {
                                align: "center",
                              })
                            }
                            onSelect={(currentValue) => {
                              onSelect(
                                currentValue === value ? "" : currentValue
                              );
                              setOpen(false);
                              setSearch("");
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                value === item.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {item.label}
                          </CommandItem>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
