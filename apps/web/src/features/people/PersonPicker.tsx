import type { PersonView } from '@smallweb/shared';

interface PersonPickerProps {
  people: PersonView[];
  person: PersonView | null;
  onChoose: (personId: string) => void;
}

// "Browsing as …": the history and the visits belong to whoever is picked here.
export function PersonPicker({ people, person, onChoose }: PersonPickerProps) {
  return (
    <label className="person-picker">
      <span>Browsing as</span>
      <select value={person?.id ?? ''} onChange={(event) => onChoose(event.target.value)}>
        {people.map((candidate) => (
          <option key={candidate.id} value={candidate.id}>
            {candidate.name}
          </option>
        ))}
      </select>
    </label>
  );
}
