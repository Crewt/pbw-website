import express from "express";
import path from "path";

const app = express();
const PORT = process.env.PORT ?? 3042;

app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => {
  console.log(`PBW server running on port ${PORT}`);
});
