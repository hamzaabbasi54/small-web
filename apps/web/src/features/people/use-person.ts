'use client';

import { useCallback, useEffect, useState } from 'react';
import type { PersonView } from '@smallweb/shared';
import { getPeople } from '@/lib/api-client';

const STORAGE_KEY = 'smallweb.person';

// localStorage can throw (private mode, blocked storage); then the choice just isn't remembered.
function readStoredId(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredId(personId: string | null): void {
  try {
    if (personId) window.localStorage.setItem(STORAGE_KEY, personId);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Not remembered across reloads; the choice still holds for this page.
  }
}

// Who is browsing (and publishing). There are no accounts: you pick a name, and the choice is
// remembered in this browser. Without a valid choice, the first person in the list is used.
export function usePerson() {
  const [people, setPeople] = useState<PersonView[]>([]);
  const [chosenId, setChosenId] = useState<string | null>(readStoredId);
  const [loadCount, setLoadCount] = useState(0);

  useEffect(() => {
    getPeople()
      .then((page) => setPeople(page.items))
      .catch(() => setPeople([]));
  }, [loadCount]);

  const person = people.find((candidate) => candidate.id === chosenId) ?? people[0] ?? null;

  const choose = useCallback((personId: string) => {
    setChosenId(personId);
    writeStoredId(personId);
  }, []);

  // The API said this person doesn't exist any more: drop the choice and fetch the list again.
  const forget = useCallback(() => {
    setChosenId(null);
    writeStoredId(null);
    setLoadCount((count) => count + 1);
  }, []);

  return { people, person, choose, forget };
}
