"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

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
import { cn } from "@/lib/utils";

const frameworks = [
  {
    value: "ethereum",
    label: "Ethereum (Mainnet)",
    chainId: 1,
  },
  {
    value: "polygon",
    label: "Polygon",
    chainId: 137,
  },
  {
    value: "arbitrum",
    label: "Arbitrum One",
    chainId: 42161,
  },
  {
    value: "optimism",
    label: "Optimism",
    chainId: 10,
  },
  {
    value: "base",
    label: "Base",
    chainId: 8453,
  },
  {
    value: "avalanche",
    label: "Avalanche C-Chain",
    chainId: 43114,
  },
  {
    value: "binance",
    label: "BNB Smart Chain",
    chainId: 56,
  },
  {
    value: "fantom",
    label: "Fantom Opera",
    chainId: 250,
  },
  {
    value: "zksync",
    label: "zkSync Era",
    chainId: 324,
  },
  {
    value: "celo",
    label: "Celo",
    chainId: 42220,
  },
  {
    value: "sepolia",
    label: "Sepolia (Testnet)",
    chainId: 11155111,
  },
  {
    value: "goerli",
    label: "Goerli (Testnet)",
    chainId: 5,
  },
];

interface ComboboxDemoProps {
  onChainSelect?: (chainId: number, chainName: string) => void;
  defaultValue?: string;
}

export function SelectChain({
  onChainSelect,
  defaultValue,
}: ComboboxDemoProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(defaultValue || "");

  const handleSelect = (currentValue: string) => {
    const newValue = currentValue === value ? "" : currentValue;
    setValue(newValue);
    setOpen(false);

    // If a chain is selected and callback is provided, send chainId and name
    if (newValue && onChainSelect) {
      const selectedChain = frameworks.find(
        (chain) => chain.value === newValue,
      );
      if (selectedChain) {
        onChainSelect(selectedChain.chainId, selectedChain.value);
      }
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value ? (
            <div className="flex w-full items-center justify-between">
              <span>
                {
                  frameworks.find((framework) => framework.value === value)
                    ?.label
                }
              </span>
              <span className="bg-muted ml-2 rounded-md px-1.5 py-0.5 text-xs">
                Chain ID:{" "}
                {
                  frameworks.find((framework) => framework.value === value)
                    ?.chainId
                }
              </span>
            </div>
          ) : (
            "Select Chain..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Search Chain..." />
          <CommandList>
            <CommandEmpty>No chain found.</CommandEmpty>
            <CommandGroup>
              {frameworks.map((framework) => (
                <CommandItem
                  key={framework.value}
                  value={framework.value}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === framework.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="flex w-full items-center justify-between">
                    <span>{framework.label}</span>
                    <span className="bg-muted rounded-md px-1.5 py-0.5 text-xs">
                      {framework.chainId}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
