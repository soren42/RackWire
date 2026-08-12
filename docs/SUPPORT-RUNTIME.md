# RackWire support runtime

`support.js` is a generated, pinned browser artifact. It parses the `<x-dc>` document in `index.html`, loads the browser runtime, and evaluates the application script. **Do not edit it directly.**

## Observed provenance

| Field | Recorded value |
|---|---|
| RackWire introduction | commit `fccf5ff` (`2026-08-11`, initial standalone import) |
| Import source | SolariNet `dashboard/public/rackwire/support.js` at commit `1f295da` |
| Generator declaration | `dc-runtime/src/*.ts` |
| Declared rebuild command | `cd dc-runtime && bun run build` |
| Generated source present here | No |
| Artifact size | 69,150 bytes |
| SHA-256 | `8fe7df74405f3c55f49b7249c74ea1397e65d07dea2b1bd3b4a489bec2e28cbe` |

The generator path and command above are copied from the artifact header. The corresponding `dc-runtime` source tree is not part of this repository, so RackWire alone cannot reproduce the file. Ownership and licensing are intentionally not inferred here; those remain subject to the active IP review.

## Runtime dependencies

`index.html` maps the runtime's pinned upstream URLs to local files through `window.__resources`. The URL strings remain inside generated code, but a normal RackWire boot uses the repository copies and makes no CDN request.

| Component | Version | Local path | SHA-256 |
|---|---:|---|---|
| React | 18.3.1 | `vendor/react.production.min.js` | `d949f1c3687aedadcedac85261865f29b17cd273997e7f6b2bfc53b2f9d4c4dd` |
| ReactDOM | 18.3.1 | `vendor/react-dom.production.min.js` | `35f4f974f4b2bcd44da73963347f8952e341f83909e4498227d4e26b98f66f0d` |
| Babel Standalone | 7.29.0 | `vendor/babel.min.js` | `2623a9e22809915ce789b4461154e277ddce520d5a4320c14d44332a5d0dcea0` |

Verify the pinned artifacts from the repository root:

```sh
sha256sum -c docs/runtime-checksums.sha256
```

## Replacement procedure

1. Obtain the exact `dc-runtime` source revision that is approved as RackWire's upstream.
2. Build it in that source repository with its documented toolchain. Do not add a build system to RackWire.
3. Review the generated diff, especially resource URLs, message handling, script evaluation, and DOM parsing.
4. Copy only the reviewed output to `support.js`.
5. Update `docs/runtime-checksums.sha256` and this document's size/hash table.
6. Exercise standalone `file://`, an HTTP origin, offline boot, dark/light chrome, and the same-origin embed bridge.

If the source revision cannot be obtained, keep the current artifact pinned. Direct repair of generated output would create an unrepeatable fork.

## Security and integration constraints

- The runtime evaluates application code with `new Function`; a strict deployment therefore needs `script-src 'self' 'unsafe-inline' 'unsafe-eval'` until the upstream runtime changes.
- Inline application styling currently needs `style-src 'self' 'unsafe-inline'`.
- The runtime accepts `__dc_theme`, `__dc_design_mode`, and `__dc_probe` window messages. An embedding host must restrict framing and message exposure at the deployment boundary; source/origin validation should be fixed upstream, not patched into this generated copy.
- The `__dc_booted` notification is posted to the parent with a wildcard target. Treat tightening that target as an upstream runtime task.
- The local browser payload is about 3.35 MB, dominated by Babel Standalone. Removing runtime compilation is a future architectural change, not part of this compatibility pin.
- Camera scanning depends on browser permission and secure-context behavior. A hosted deployment should set an intentional `Permissions-Policy`; a file-origin browser may behave differently.

## Release gate

Every release that changes `support.js`, `index.html` resource mappings, or any file under `vendor/` must pass the checksum check and an offline cold-load test. A checksum mismatch is a release blocker until the change is explained and the pins are deliberately updated.
