export const formatFileSize = (size: number) => {
  if (size <= 0) {
    return "0 B"
  }

  const units: readonly string[] = ["B", "KB", "MB", "GB"]
  const unitIndex: number = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1)
  const value: number = size / 1024 ** unitIndex

  return `${value.toLocaleString("en-US", {
    maximumFractionDigits: value >= 10 ? 0 : 1,
  })} ${units[unitIndex]}`
}

export const formatDate = (timestamp: number) => {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(timestamp)
}
