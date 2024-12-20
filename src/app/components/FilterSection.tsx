import React from "react";

const FilterSection: React.FC<{
  label: string;
  options: string[];
  selected: string[];
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
}> = ({ label, options, selected, setSelected }) => (
  <div className="mt-3">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </label>
    <div className="space-y-2 mt-2">
      {options.map((option) => (
        <div key={option} className="flex items-center">
          <input
            type="checkbox"
            id={option}
            value={option}
            checked={selected.includes(option)}
            onChange={() =>
              setSelected((prev) =>
                prev.includes(option)
                  ? prev.filter((item) => item !== option)
                  : [...prev, option]
              )
            }
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label
            htmlFor={option}
            className="ml-2 text-sm text-gray-700 dark:text-gray-300"
          >
            {option}
          </label>
        </div>
      ))}
    </div>
  </div>
);

export default FilterSection;
