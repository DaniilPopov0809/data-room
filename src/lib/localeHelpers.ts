export const getUserLocale = (): string | undefined => {
  if (typeof navigator === "undefined") {
    return undefined
  }

  return navigator.language
}

export const normalizeForComparison = (value: string): string => {
  return value.normalize("NFKC").trim().toLocaleLowerCase(getUserLocale())
}

export const matchesSearchQuery = (name: string, query: string): boolean => {
  const normalizedQuery: string = normalizeForComparison(query)

  if (!normalizedQuery) {
    return false
  }

  return normalizeForComparison(name).includes(normalizedQuery)
}

export const compareLocalizedNames = (left: string, right: string): number => {
  return left.localeCompare(right, getUserLocale(), { sensitivity: "base", numeric: true })
}
