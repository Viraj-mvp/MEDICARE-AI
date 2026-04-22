export interface PubMedArticle {
  pmid: string
  title: string
  authors: string
  journal: string
  year: string
  url: string
}

export async function fetchClinicalEvidence(
  diagnosis: string,
  maxResults = 3
): Promise<PubMedArticle[]> {

  // Step 1 — Search for PMIDs
  try {
    const searchRes = await fetch(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi` +
      `?db=pubmed&term=${encodeURIComponent(diagnosis + '[Title] India')}` +
      `&retmax=${maxResults}&retmode=json&sort=relevance`
    )
    const searchData = await searchRes.json()
    const ids: string[] = searchData.esearchresult?.idlist ?? []
    if (!ids.length) return []

    // Step 2 — Fetch summaries for those PMIDs
    const summaryRes = await fetch(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi` +
      `?db=pubmed&id=${ids.join(',')}&retmode=json`
    )
    const summaryData = await summaryRes.json()
    const result = summaryData.result

    return ids.map(id => {
      const article = result[id]
      return {
        pmid:    id,
        title:   article.title,
        authors: article.authors?.[0]?.name ?? 'et al.',
        journal: article.source,
        year:    article.pubdate?.split(' ')[0] ?? '',
        url:     `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
      }
    })
  } catch (error) {
    console.error('Failed to fetch clinical evidence:', error)
    return []
  }
}
