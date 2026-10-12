export function ipToLong(ip: string): number {
  return ip
    .split('.')
    .reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

export function longToIp(long: number): string {
  return [
    (long >>> 24) & 255,
    (long >>> 16) & 255,
    (long >>> 8) & 255,
    long & 255,
  ].join('.');
}

export function cidrToMask(cidrBits: number): string {
  if (cidrBits < 0 || cidrBits > 32) return '255.255.255.0';
  const maskLong = cidrBits === 0 ? 0 : (~0 << (32 - cidrBits)) >>> 0;
  return longToIp(maskLong);
}

export function maskToCidr(mask: string): number {
  const maskLong = ipToLong(mask);
  let count = 0;
  for (let i = 31; i >= 0; i--) {
    if ((maskLong & (1 << i)) !== 0) count++;
    else break;
  }
  return count;
}

export function getNetworkAddress(ip: string, mask: string): string {
  const ipL = ipToLong(ip);
  const maskL = ipToLong(mask);
  return longToIp((ipL & maskL) >>> 0);
}

export function getBroadcastAddress(ip: string, mask: string): string {
  const ipL = ipToLong(ip);
  const maskL = ipToLong(mask);
  const invertedMask = (~maskL) >>> 0;
  return longToIp((ipL | invertedMask) >>> 0);
}

export function isIpInSubnet(ip: string, cidr: string): boolean {
  if (!cidr || !cidr.includes('/')) return false;
  const [subnetIp, bitsStr] = cidr.split('/');
  const bits = parseInt(bitsStr, 10);
  const mask = cidrToMask(bits);
  return getNetworkAddress(ip, mask) === getNetworkAddress(subnetIp, mask);
}

export interface SubnetInfo {
  ip: string;
  cidr: number;
  mask: string;
  network: string;
  broadcast: string;
  firstUsable: string;
  lastUsable: string;
  totalHosts: number;
  usableHosts: number;
}

export function calculateSubnetDetails(ipWithCidr: string): SubnetInfo {
  const [ip, bitsStr] = ipWithCidr.split('/');
  const cidr = parseInt(bitsStr || '24', 10);
  const mask = cidrToMask(cidr);
  const network = getNetworkAddress(ip, mask);
  const broadcast = getBroadcastAddress(ip, mask);

  const netL = ipToLong(network);
  const bcastL = ipToLong(broadcast);

  const totalHosts = Math.pow(2, 32 - cidr);
  const usableHosts = totalHosts > 2 ? totalHosts - 2 : 0;

  const firstUsable = usableHosts > 0 ? longToIp(netL + 1) : network;
  const lastUsable = usableHosts > 0 ? longToIp(bcastL - 1) : broadcast;

  return {
    ip,
    cidr,
    mask,
    network,
    broadcast,
    firstUsable,
    lastUsable,
    totalHosts,
    usableHosts,
  };
}

export function generateMacAddress(): string {
  const hexDigits = '0123456789ABCDEF';
  let mac = '00:1A:2B:';
  for (let i = 0; i < 3; i++) {
    const b1 = hexDigits[Math.floor(Math.random() * 16)];
    const b2 = hexDigits[Math.floor(Math.random() * 16)];
    mac += (i > 0 ? ':' : '') + b1 + b2;
  }
  return mac;
}

export function isValidIPv4(ip: string): boolean {
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  return parts.every((p) => {
    const n = parseInt(p, 10);
    return !isNaN(n) && n >= 0 && n <= 255 && p === n.toString();
  });
}
