const VIEWER_HASH_PREFIXES = ['#/insights/', '#/ops/flow-intelligence/insights/'];

/**
 * Returns true when Grafana is in the iframe of a Pulse UI dashboard viewer page. A parent on
 * another origin throws on the location read and is not a Pulse UI viewer.
 */
export const isInPulseDashboardViewer = (): boolean => {
  try {
    if (window.parent === window.self) {
      return false;
    }
    const parentHash = window.parent.location.hash;
    return VIEWER_HASH_PREFIXES.some((prefix) => parentHash.startsWith(prefix));
  } catch {
    return false;
  }
};
