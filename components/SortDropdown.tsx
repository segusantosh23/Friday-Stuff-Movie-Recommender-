import React from 'react';

interface SortDropdownProps {
  sortOption: string;
  setSortOption: (option: string) => void;
  isForClientSide?: boolean;
}

const SortDropdown: React.FC<SortDropdownProps> = ({ sortOption, setSortOption, isForClientSide }) => {
  const sortOptions = [
    { value: 'popularity.desc', label: 'Popularity' },
    { value: 'release_date.desc', label: 'Newest First' },
    { value: 'release_date.asc', label: 'Oldest First' },
    { value: 'vote_average.desc', label: 'Highest Rated' },
  ];

  return (
    <div>
      <label htmlFor="sort-select" className="block mb-2 text-sm font-medium text-slate-600 dark:text-slate-400 sr-only md:not-sr-only">Sort by</label>
      <select
        id="sort-select"
        value={sortOption}
        onChange={(e) => setSortOption(e.target.value)}
        className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        aria-label="Sort movies"
      >
        {sortOptions.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
};

export default SortDropdown;
