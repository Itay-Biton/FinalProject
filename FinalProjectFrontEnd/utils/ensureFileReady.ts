// utils/ensureFileReady.ts
import RNFS from 'react-native-fs';

/** Wait up to 3s until a non-empty file exists at the given URI/path. */
export async function ensureFileReady(uriOrPath: string, maxWaitMs = 3000) {
  const p = uriOrPath.replace(/^file:\/\//, '');
  const start = Date.now();
  let lastSize = -1,
    stableCount = 0;

  while (Date.now() - start < maxWaitMs) {
    try {
      const st = await RNFS.stat(p);
      if (st.isFile() && Number(st.size) > 0) {
        // extra: require two consecutive equal sizes to be sure writes are done
        if (Number(st.size) === lastSize) {
          stableCount += 1;
          if (stableCount >= 2) return;
        } else {
          stableCount = 0;
          lastSize = Number(st.size);
        }
      }
    } catch {}
    await new Promise(r => setTimeout(r, 100));
  }
  // If we exit the loop, we’ll try anyway — but this eliminates most races.
}
