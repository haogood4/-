import { describe, expect, it } from "vitest";
import { calculateSubnet } from "./ip-subnet-cn";
describe("ip-subnet-cn", () => {
  it("192.168.1.0/24", () => {
    const r = calculateSubnet({ ip: "192.168.1.0", cidr: "24" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.network).toBe("192.168.1.0");
      expect(r.value.broadcast).toBe("192.168.1.255");
      expect(r.value.usable).toBe(254);
    }
  });
});
