const dns = require("dns");

dns.setServers(["1.1.1.1", "8.8.8.8"]);

dns.resolveSrv(
  "_mongodb._tcp.eleoka-cluster-dev.9oeto8d.mongodb.net",
  (error, addresses) => {
    if (error) {
      console.error("DNS ERROR:", error);
      return;
    }

    console.log("DNS SUCCESS:");
    console.log(addresses);
  },
);
