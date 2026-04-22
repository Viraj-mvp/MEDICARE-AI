export async function getConditionSummary(condition: string): Promise<string | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

  try {
    const res = await fetch(
      `https://connect.medlineplus.gov/service` +
      `?mainSearchCriteria.v.cs=2.16.840.1.113883.6.177` +
      `&mainSearchCriteria.v.dn=${encodeURIComponent(condition)}` +
      `&informationRecipient.languageCode.c=en` +
      `&knowledgeResponseType=application/json`,
      { signal: controller.signal }
    )
    clearTimeout(timeoutId);
    const data = await res.json()
    const entry = data.feed?.entry?.[0]
    return entry?.summary?.['_value'] ?? null
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.warn('MedlinePlus request timed out');
    } else {
      console.error('MedlinePlus Error:', error)
    }
    return null
  } finally {
    clearTimeout(timeoutId);
  }
}
