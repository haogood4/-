export type SubnetInput = { ip: string; cidr: string };
export type SubnetResult = {
  network: string;
  broadcast: string;
  usable: number;
  mask: string;
};
export type SubnetCalcResult =
  | { ok: true; value: SubnetResult }
  | { ok: false; error: { code: string; message: string } };
export function ipToInt(ip: string): number {
  return ip.split(".").reduce((acc, o) => (acc << 8) + Number(o), 0) >>> 0;
}
export function intToIp(n: number): string {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(
    ".",
  );
}
export function calculateSubnet(input: SubnetInput): SubnetCalcResult {
  const cidr = Number(input.cidr);
  if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(input.ip))
    return {
      ok: false,
      error: { code: "INVALID_FORMAT", message: "IP 格式错误" },
    };
  if (!Number.isInteger(cidr) || cidr < 0 || cidr > 32)
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "CIDR 须 0-32" },
    };
  const ip = ipToInt(input.ip);
  const mask = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
  const network = (ip & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const usable =
    cidr >= 31
      ? Math.max(0, Math.pow(2, 32 - cidr) - 2)
      : Math.pow(2, 32 - cidr) - 2;
  return {
    ok: true,
    value: {
      network: intToIp(network),
      broadcast: intToIp(broadcast),
      usable,
      mask: intToIp(mask),
    },
  };
}
export function formatSubnet(value: SubnetResult) {
  return {
    network: value.network,
    broadcast: value.broadcast,
    usable: String(value.usable),
    mask: value.mask,
  };
}
