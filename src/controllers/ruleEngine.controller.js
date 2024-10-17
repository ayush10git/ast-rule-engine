import {
  createRule,
  combineRules,
  evaluateRule,
  modifyRuleOperator,
  modifyRuleOperand,
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

const modifyRuleOperatorController = asyncHandler(async (req, res) => {
  const { ruleId, newOperator } = req.body;

  if (!ruleId || !newOperator) {
    throw new ApiError(
      400,
      "Missing ruleId or newOperator in the request body"
    );
  }

  if (newOperator !== "AND" && newOperator !== "OR") {
    throw new ApiError(400, "Invalid operator. Must be 'AND' or 'OR'");
  }

  const rule = await Rule.findById(ruleId);

  if (!rule) {
    throw new ApiError(404, "Rule not found");
  }

  const modifiedAST = modifyRuleOperator(rule.ast, newOperator);

  const currentRuleName = rule.rule_name;
  const updatedRuleName = currentRuleName.replace(/(AND|OR)/, newOperator);

  rule.ast = modifiedAST;
  rule.rule_name = updatedRuleName;

  rule.markModified("ast");

  const updatedRule = await rule.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedRule.ast,
        `Operator successfully modified to '${newOperator}', rule_name updated to '${updatedRuleName}'`
      )
    );
});

const modifyRuleOperandController = asyncHandler(async (req, res) => {
  const { ruleId, attribute, newValue } = req.body;

  if (!ruleId || !attribute || !newValue) {
    throw new ApiError(
      400,
      "Missing ruleId, attribute, or newValue in the request body"
    );
  }

  const rule = await Rule.findById(ruleId);

  if (!rule) {
    throw new ApiError(404, "Rule not found");
  }

  const modifiedAST = modifyRuleOperand(rule.ast, attribute, newValue);

  const currentRuleName = rule.rule_name;

  const updatedRuleName = currentRuleName.replace(
    new RegExp(`(${attribute} [^ ]+)`),
    `${attribute} ${newValue}`
  );

  rule.ast = modifiedAST;
  rule.rule_name = updatedRuleName;

  rule.markModified("ast");

  const updatedRule = await rule.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedRule.ast,
        `Operand for attribute '${attribute}' successfully modified to '${newValue}', rule_name updated to '${updatedRuleName}'`
      )
    );
});

export {
  createRuleEngine,
  combineRulesController,
  evaluateRulesController,
  modifyRuleOperatorController,
  modifyRuleOperandController,
};
