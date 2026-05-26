const allowedSubnets = (
  process.env.ALLOWED_SUBNETS || "192.168.1.,10.0.0."
).split(",");

const networkValidation = (req, res, next) => {
  let clientIp =
    req.ip || req.connection.remoteAddress || req.socket.remoteAddress;

  // Normalize IPv4-mapped IPv6 addresses like ::ffff:127.0.0.1
  if (clientIp && clientIp.startsWith("::ffff:")) {
    clientIp = clientIp.substring(7);
  }

  // Normalize ::1 to 127.0.0.1 for localhost check
  let normalizedIp = clientIp;
  if (normalizedIp === "::1") {
    normalizedIp = "127.0.0.1";
  }

  const isAllowed = allowedSubnets.some((subnet) => {
    // Allow exact IP match for localhost
    if (subnet === normalizedIp) return true;
    // Allow subnet prefix match (e.g., 192.168.1.)
    if (normalizedIp.startsWith(subnet)) return true;
    // Special case for 127.0.0.1 and local subnets
    if (subnet === "127.0.0." && normalizedIp.startsWith("127.0.0."))
      return true;
    if (subnet === "::1" && clientIp === "::1") return true;
    return false;
  });

  if (!isAllowed) {
    console.warn(
      `Blocked request from IP: ${clientIp} (normalized: ${normalizedIp})`,
    );
    return res
      .status(403)
      .json({ message: "Forbidden: Access only from authorized network" });
  }

  req.clientIp = clientIp;
  next();
};

module.exports = networkValidation;
