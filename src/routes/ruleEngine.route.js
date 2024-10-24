import express from "express";
import {
  combineRulesController,
  createRuleEngine,
  evaluateRulesController,
} from "../controllers/ruleEngine.controller.js";

const router = express.Router();

router.route("/create").post(createRuleEngine);
router.route("/combine").post(combineRulesController);
router.route("/evaluate").post(evaluateRulesController);

export default router;
