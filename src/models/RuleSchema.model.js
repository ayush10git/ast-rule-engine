import mongoose from "mongoose";

const ASTNodeSchema = new mongoose.Schema({
  type: { type: String, required: true }, 
  value: { type: mongoose.Mixed, required: true },
  left: { type: mongoose.Schema.Types.Mixed }, 
  right: { type: mongoose.Schema.Types.Mixed } 
});

const RuleSchema = new mongoose.Schema({
  rule_name: { type: String, required: true },
  description: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  ast: ASTNodeSchema
});

export const Rule = mongoose.model('Rule', RuleSchema);
