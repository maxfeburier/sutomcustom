import words from "../utils/dico.json";

export const callWordApi = async (attempt: string) => {
  const dicoWords: string[] = words as string[];
  const lowerCaseAttempt = attempt.toLowerCase();

  if (dicoWords.includes(lowerCaseAttempt)) {
    return true;
  }

  const response2 = await fetch(
    `https://www.cnrtl.fr/definition/${lowerCaseAttempt}`,
  );
  if (response2.ok) {
    const text = await response2.text();
    if (!text.includes("Cette forme est introuvable !")) {
      return true;
    }
  }

  const response1 = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${lowerCaseAttempt}`,
  );
  if (response1.ok) {
    return true;
  }

  const response = await fetch(
    `https://freedictionaryapi.com/api/v1/entries/fr/${lowerCaseAttempt}`,
  );
  if (!response.ok) {
    return false;
  }
  const data = (await response.json()) as { entries: any[] };
  return data.entries && data.entries.length > 0;
};
