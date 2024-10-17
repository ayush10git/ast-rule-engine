import mongoose from "mongoose";

// Define the schema for AST (Abstract Syntax Tree)
const ASTNodeSchema = new mongoose.Schema({
  type: { type: String, required: true }, // 'operator' or 'operand'
  value: { type: mongoose.Mixed, required: true }, // 'AND', 'OR' for operator or operand condition
  left: { type: mongoose.Schema.Types.Mixed }, // Reference to another node for 'left'
  right: { type: mongoose.Schema.Types.Mixed } // Reference to another node for 'right'
});

// Rule schema containing metadata and the AST structure
const RuleSchema = new mongoose.Schema({
  rule_name: { type: String, required: true },
  description: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  ast: ASTNodeSchema // Embedding the AST inside the rule schema
});

// Compile the schema into a model
export const Rule = mongoose.model('Rule', RuleSchema);
