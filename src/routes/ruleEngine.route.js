import express from "express";
import {
  combineRulesController,
  createRuleEngine,
  evaluateRulesController,
  modifyRuleOperandController,
  modifyRuleOperatorController,
} from "../controllers/ruleEngine.controller.js";

const router = express.Router();

router.route("/create").post(createRuleEngine);
router.route("/combine").post(combineRulesController);
router.route("/evaluate").post(evaluateRulesController);
router.route("/modify-operator").post(modifyRuleOperatorController);
router.route("/modify-operand").post(modifyRuleOperandController);

export default router;
