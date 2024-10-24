import {
  createRule,
  combineRules,
  evaluateRule,
} from "../utils/ast.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { validateRuleString } from "../utils/ast.js";
import { Rule } from "../models/RuleSchema.model.js";

const createRuleEngine = asyncHandler(async (req, res) => {
  const { rule_string } = req.body;

  if (!validateRuleString(rule_string)) {
    throw new ApiError(400, "Invalid Rule String Format");
  }

  const ast = createRule(rule_string);

  if (!ast) {
    console.error(`Failed to create AST for rule: ${rule_string}`);
    throw new ApiError(400, "Failed to create AST from rule string");
  }

  const newRule = new Rule({ rule_name: rule_string, ast });
  await newRule.save();

  return res
    .status(201)
    .json(new ApiResponse(201, newRule, "Rule Created Successfully"));
});

const combineRulesController = asyncHandler(async (req, res) => {
  const { rules, operators } = req.body;

  if (!Array.isArray(rules) || rules.length === 0) {
    throw new ApiError(400, "No rules provided");
  }

  if (!Array.isArray(operators) || operators.length !== rules.length - 1) {
    throw new ApiError(400, "Invalid number of operators provided");
  }

  const validOperators = ["AND", "OR"];
  for (const op of operators) {
    if (!validOperators.includes(op)) {
      throw new ApiError(400, "Invalid operator. Must be 'AND' or 'OR'");
    }
  }

  const asts = rules.map((ruleString) => {
    if (!validateRuleString(ruleString)) {
      throw new ApiError(400, `Invalid rule format: ${ruleString}`);
    }

    const ast = createRule(ruleString);
    if (!ast) {
      throw new ApiError(400, `Failed to create AST for rule: ${ruleString}`);
    }

    return ast;
  });

  let combinedAST = asts[0];
  for (let i = 1; i < asts.length; i++) {
    combinedAST = combineRules([combinedAST, asts[i]], operators[i - 1]);
  }

  if (!combinedAST) {
    throw new ApiError(400, "Failed to combine rules into a single AST");
  }

  // Save the combined rule to MongoDB
  const combinedRuleString = rules.join(` ${operators.join(" ")} `);
  const newRule = new Rule({ rule_name: combinedRuleString, ast: combinedAST });
  await newRule.save();

  return res
    .status(201)
    .json(
      new ApiResponse(201, newRule, "Rules combined and saved successfully")
    );
});

const evaluateRulesController = asyncHandler(async (req, res) => {
  const { ast, data } = req.body;

  if (!ast || !data) {
    throw new ApiError(400, "Missing AST or data for evaluation");
  }

  const result = evaluateRule(ast, data);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.message,
    });
  }

  return res.status(200).json({
    success: true,
    message: result.message,
  });
});

export {
  createRuleEngine,
  combineRulesController,
  evaluateRulesController,
};
