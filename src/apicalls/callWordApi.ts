export const callWordApi = async (attempt: string) => {
  const response1 = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${attempt.toLowerCase()}`,
  );
  if (response1.ok) {
    return true;
  }

  const response = await fetch(
    `https://freedictionaryapi.com/api/v1/entries/fr/${attempt.toLowerCase()}`,
  );
  if (!response.ok) {
    return false;
  }
  const data = (await response.json()) as { entries: any[] };
  return data.entries && data.entries.length > 0;
};
