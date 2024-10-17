import express from "express";

const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

import ruleEngineRouter from "./routes/ruleEngine.route.js";

app.use("/ruleEng", ruleEngineRouter);

export { app }