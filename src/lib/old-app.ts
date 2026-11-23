import "server-only";
import { request as httpsRequest } from "node:https";
import type { IncomingHttpHeaders } from "node:http";

/**
 * Direct connection to the old Prime 1 Laravel app (MLS home search) on the GoDaddy server.
 * Connects to OLD_SERVER_IP but sends SNI + Host OLD_SERVER_HOST, so it works whatever public DNS says.
 */
export const OLD_HOST = process.env.OLD_SERVER_HOST || "prime1realty.net";
const OLD_IP = process.env.OLD_SERVER_IP || "50.63.133.85";

export type OldResponse = { status: number; headers: IncomingHttpHeaders; body: Buffer };

export function oldAppFetch(path: string, opts: { method?: string; headers?: Record<string, string>; body?: Buffer; timeoutMs?: number } = {}) {
  return new Promise<OldResponse>((resolve, reject) => {
    const r = httpsRequest(
      {
        host: OLD_HOST,
        servername: OLD_HOST,
        port: 443,
        method: opts.method ?? "GET",
        path,
        headers: { host: OLD_HOST, "accept-encoding": "identity", ...(opts.headers ?? {}) },
        timeout: opts.timeoutMs ?? 25_000,
        lookup: (_h, o, cb) => {
          if ((o as { all?: boolean }).all) (cb as unknown as (e: null, a: { address: string; family: number }[]) => void)(null, [{ address: OLD_IP, family: 4 }]);
          else cb(null, OLD_IP, 4);
        },
      },
      (resp) => {
        const chunks: Buffer[] = [];
        resp.on("data", (c: Buffer) => chunks.push(c));
        resp.on("end", () => resolve({ status: resp.statusCode ?? 502, headers: resp.headers, body: Buffer.concat(chunks) }));
        resp.on("error", reject);
      },
    );
    r.on("timeout", () => r.destroy(new Error("timeout")));
    r.on("error", reject);
    if (opts.body) r.write(opts.body);
    r.end();
  });
}
