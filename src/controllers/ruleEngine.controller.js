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

  // Save the AST to MongoDB
  const newRule = new Rule({ rule_name: rule_string, ast });
  await newRule.save();

  return res
    .status(201)
    .json(new ApiResponse(201, newRule, "Rule Created Successfully"));
});

const combineRulesController = asyncHandler(async (req, res) => {
  const { rules, operators } = req.body;

  // Ensure 'rules' is an array and not empty
  if (!Array.isArray(rules) || rules.length === 0) {
    throw new ApiError(400, "No rules provided");
  }

  // Ensure 'operators' is an array, has one less operator than rules, and contains valid operators
  if (!Array.isArray(operators) || operators.length !== rules.length - 1) {
    throw new ApiError(400, "Invalid number of operators provided");
  }

  // Check if operators are either "AND" or "OR"
  const validOperators = ["AND", "OR"];
  for (const op of operators) {
    if (!validOperators.includes(op)) {
      throw new ApiError(400, "Invalid operator. Must be 'AND' or 'OR'");
    }
  }

  // Validate and create ASTs for each rule
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

  // Combine ASTs sequentially using the provided operators
  let combinedAST = asts[0]; // Start with the first rule's AST
  for (let i = 1; i < asts.length; i++) {
    combinedAST = combineRules([combinedAST, asts[i]], operators[i - 1]); // Combine with the next AST using the next operator
  }

  if (!combinedAST) {
    throw new ApiError(400, "Failed to combine rules into a single AST");
  }

  // Save the combined rule to MongoDB
  const combinedRuleString = rules.join(` ${operators.join(" ")} `);
  const newRule = new Rule({ rule_name: combinedRuleString, ast: combinedAST });
  await newRule.save();

  // Respond with the combined AST and rule name
  return res
    .status(201)
    .json(
      new ApiResponse(201, newRule, "Rules combined and saved successfully")
    );
});

const evaluateRulesController = asyncHandler(async (req, res) => {
  const { ast, data } = req.body;

  // Ensure both AST and data are provided
  if (!ast || !data) {
    throw new ApiError(400, "Missing AST or data for evaluation");
  }

  // Call the evaluateRule function to process the AST with provided data
  const result = evaluateRule(ast, data);

  // Return the evaluation result along with a message
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

  // Ensure the ruleId and newOperator are provided
  if (!ruleId || !newOperator) {
    throw new ApiError(
      400,
      "Missing ruleId or newOperator in the request body"
    );
  }

  // Ensure the newOperator is either "AND" or "OR"
  if (newOperator !== "AND" && newOperator !== "OR") {
    throw new ApiError(400, "Invalid operator. Must be 'AND' or 'OR'");
  }

  // Fetch the rule by its _id
  const rule = await Rule.findById(ruleId);

  if (!rule) {
    throw new ApiError(404, "Rule not found");
  }

  // Modify the operator in the AST using the helper function
  const modifiedAST = modifyRuleOperator(rule.ast, newOperator);

  // Keep the existing attributes but update the operator in the rule_name
  const currentRuleName = rule.rule_name;
  const updatedRuleName = currentRuleName.replace(/(AND|OR)/, newOperator);

  // Update the rule document with the modified AST and updated rule_name
  rule.ast = modifiedAST;
  rule.rule_name = updatedRuleName;

  // Mark the ast field as modified
  rule.markModified("ast");

  // Save the updated rule back to the database
  const updatedRule = await rule.save();

  // Return the modified AST and rule_name in the response
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

  // Ensure the ruleId, attribute, and newValue are provided
  if (!ruleId || !attribute || !newValue) {
    throw new ApiError(
      400,
      "Missing ruleId, attribute, or newValue in the request body"
    );
  }

  // Fetch the rule by its _id
  const rule = await Rule.findById(ruleId);

  if (!rule) {
    throw new ApiError(404, "Rule not found");
  }

  // Modify the operand in the AST using the helper function
  const modifiedAST = modifyRuleOperand(rule.ast, attribute, newValue);

  // Keep the existing rule_name but replace the operand value
  const currentRuleName = rule.rule_name;

  // Regular expression to replace the current value (e.g., '> 30' with '> newValue')
  const updatedRuleName = currentRuleName.replace(
    new RegExp(`(${attribute} [^ ]+)`),
    `${attribute} ${newValue}`
  );

  // Update the rule document with the modified AST and updated rule_name
  rule.ast = modifiedAST;
  rule.rule_name = updatedRuleName;

  // Mark the ast field as modified
  rule.markModified("ast");

  // Save the updated rule back to the database
  const updatedRule = await rule.save();

  // Return the modified AST and rule_name in the response
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
