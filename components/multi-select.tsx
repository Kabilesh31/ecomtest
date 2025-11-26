"use client";

import { useState } from "react";
import { X } from "lucide-react";

export interface MultiSelectOption {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export default function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options",
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      {/* Selected badges */}
      <div
        onClick={() => setOpen(!open)}
        className="border rounded p-2 min-h-[44px] cursor-pointer flex flex-wrap gap-2"
      >
        {selected.length === 0 && (
          <span className="text-gray-500">{placeholder}</span>
        )}

        {selected.map((id) => {
          const item = options.find((o) => o.value === id);
          if (!item) return null;
          return (
            <span
              key={id}
              className="bg-blue-600 text-white px-2 py-1 rounded flex items-center gap-1 text-sm"
            >
              {item.label}
              <X
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(id);
                }}
                className="w-3 h-3 cursor-pointer"
              />
            </span>
          );
        })}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute w-full mt-1 bg-white border rounded shadow-lg z-50 max-h-52 overflow-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full p-2 border-b outline-none"
          />

          {filtered.length === 0 && (
            <div className="p-2 text-gray-500">No results</div>
          )}

          {filtered.map((item) => (
            <div
              key={item.value}
              onClick={() => handleSelect(item.value)}
              className={`p-2 cursor-pointer hover:bg-gray-100 ${
                selected.includes(item.value) ? "bg-gray-200" : ""
              }`}
            >
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
