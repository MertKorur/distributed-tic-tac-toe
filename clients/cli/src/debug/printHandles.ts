// clients/cli/src/debug/printHandles.ts
// Run with: npx ts-node src/debug/printHandles.ts
setTimeout(() => {
  console.log('Active handles (name, stack if available):');
  // @ts-ignore - internal API
  const handles = process._getActiveHandles() as any[];
  handles.forEach((h, i) => {
    const name = h.constructor?.name || typeof h;
    console.log(`#${i} -> ${name}`);
    if (h?.hasOwnProperty('bytesRead')) console.log('  -> stream-like handle');
    if (h?.constructor?.name === 'Socket' && (h as any).remoteAddress) {
      console.log(`  -> socket: ${(h as any).remoteAddress}:${(h as any).remotePort}`);
    }
    // best-effort: print stack if available (some libs attach createdAt)
    if ((h as any).__createdAt) console.log('  createdAt:', (h as any).__createdAt);
  });

  // also show active requests
  // @ts-ignore
  const reqs = process._getActiveRequests ? process._getActiveRequests() : [];
  console.log('Active requests count:', reqs.length);
  process.exit(0);
}, 1200);
