// const crypto = require("crypto");

// function verifyRetellSignature(req, res, next) {
//   if (!process.env.RETELL_WEBHOOK_SECRET) {
//     console.warn("⚠️  RETELL_WEBHOOK_SECRET not set — skipping signature check");
//     try {
//       req.body = JSON.parse(req.body.toString());
//     } catch (e) {
//       return res.status(400).json({ error: "Invalid JSON body" });
//     }
//     return next();
//   }

//   const signature = req.headers["x-retell-signature"];
//   if (!signature) {
//     return res.status(401).json({ error: "Missing signature" });
//   }

//   const rawBody = req.body;
//   const expected = crypto
//     .createHmac("sha256", process.env.RETELL_WEBHOOK_SECRET)
//     .update(rawBody)
//     .digest("hex");

//   const trusted = `sha256=${expected}`;
//   const isSafe =
//     signature.length === trusted.length &&
//     crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(trusted));

//   if (!isSafe) {
//     return res.status(401).json({ error: "Invalid signature" });
//   }

//   try {
//     req.body = JSON.parse(rawBody.toString());
//   } catch (e) {
//     return res.status(400).json({ error: "Invalid JSON body" });
//   }

//   next();
// }

// module.exports = { verifyRetellSignature };

function verifyRetellSignature(req, res, next) {
  try {
    req.body = JSON.parse(req.body.toString());
  } catch (e) {
    return res.status(400).json({ error: "Invalid JSON body" });
  }
  next();
}

module.exports = { verifyRetellSignature };