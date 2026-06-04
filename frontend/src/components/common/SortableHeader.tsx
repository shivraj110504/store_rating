import { ChevronUp, ChevronDown } from 'lucide-react';

interface Props {
  label: string;
  field: string;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
  onSort: (field: string) => void;
}

export default function SortableHeader({ label, field, sortBy, sortOrder, onSort }: Props) {
  const active = sortBy === field;
  return (
    <th className={active ? 'sorted' : ''} onClick={() => onSort(field)}>
      {label}
      <span className="sort-icon">
        {active ? (sortOrder === 'ASC' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : <ChevronUp size={12} />}
      </span>
    </th>
  );
}
