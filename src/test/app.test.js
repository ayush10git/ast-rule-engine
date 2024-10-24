// utils/ast.js

// src/test/app.test.js

import { createRule, combineRules, evaluateRule, Node } from "../utils/ast.js";

describe("Rule Engine Tests", () => {
  // 1. Create individual rules using createRule and verify AST representation
  describe("createRule - AST Creation", () => {
    test("should create valid AST from a simple rule", () => {
      const ruleString = "age > 30";
      const ast = createRule(ruleString);

      expect(ast).toBeInstanceOf(Node);
      expect(ast.value).toMatchObject({
        attribute: "age",
        operator: ">",
        value: 30,
      });
      expect(ast.type).toBe("operand");
    });

    test("should create valid AST from a complex rule with AND", () => {
      const ruleString = "age > 30 AND salary < 5000";
      const ast = createRule(ruleString);

      expect(ast).toBeInstanceOf(Node);
      expect(ast.value).toBe("AND");
      expect(ast.left).toMatchObject({
        type: "operand",
        value: { attribute: "age", operator: ">", value: 30 },
      });
      expect(ast.right).toMatchObject({
        type: "operand",
        value: { attribute: "salary", operator: "<", value: 5000 },
      });
    });

    test("should throw error for invalid rule string", () => {
      const invalidRuleString = "age ! 30";
      expect(() => {
        createRule(invalidRuleString);
      }).toThrowError(/Invalid operand format/);
    });
  });

  // 2. Combine rules using combineRules and verify AST representation
  describe("combineRules - Combining ASTs", () => {
    test("should combine multiple rules with AND operators", () => {
      const rule1 = createRule("age > 26");
      const rule2 = createRule("salary < 60000");
      const rule3 = createRule("department = 'Marketing'");

      const combinedAST = combineRules([rule1, rule2, rule3]);

      expect(combinedAST.value).toBe("AND");
      expect(combinedAST.left.value).toBe("AND");
      expect(combinedAST.left.left).toMatchObject(rule1);
      expect(combinedAST.left.right).toMatchObject(rule2);
      expect(combinedAST.right).toMatchObject(rule3);
    });

    test("should combine age > 30 and salary < 50000 with AND operator", () => {
      const rule1 = createRule("age > 30");
      const rule2 = createRule("salary < 50000");

      const combinedAST = combineRules([rule1, rule2]);

      expect(combinedAST.value).toBe("AND");

      expect(combinedAST.left).toMatchObject(rule1);

      expect(combinedAST.right).toMatchObject(rule2);
    });
    
  });

  // 3. Implement sample JSON data and test evaluateRule for different scenarios
  describe("evaluateRule - Evaluating AST with data", () => {
    test("should pass when data satisfies rule condition", () => {
      const ruleAST = createRule("age > 30");
      const data = { age: 35 };

      const result = evaluateRule(ruleAST, data);

      expect(result.success).toBe(true);
      expect(result.message).toBe("Condition passed: age > 30");
    });

    test("should fail when data does not meet rule condition", () => {
      const ruleAST = createRule("age > 30");
      const data = { age: 25 };

      const result = evaluateRule(ruleAST, data);

      expect(result.success).toBe(false);
      expect(result.message).toBe("Condition failed: age > 30");
    });

    test("should handle AND logic between two conditions", () => {
      const ruleAST = createRule("age > 30 AND salary < 5000");
      const data = { age: 35, salary: 4000 };

      const result = evaluateRule(ruleAST, data);

      expect(result.success).toBe(true);
      expect(result.message).toBe("Both conditions passed for AND");
    });

    test("should fail when one condition fails in AND logic", () => {
      const ruleAST = createRule("age > 30 AND salary < 5000");
      const data = { age: 35, salary: 6000 };

      const result = evaluateRule(ruleAST, data);

      expect(result.success).toBe(false);
      expect(result.message).toBe("Condition failed: salary < 5000");
    });

    test("should handle OR logic between two conditions", () => {
      const ruleAST = createRule("age > 30 OR salary < 5000");
      const data = { age: 25, salary: 6000 };

      const result = evaluateRule(ruleAST, data);

      expect(result.success).toBe(false);
      expect(result.message).toBe("Both conditions failed for OR");
    });
  });

  // 4. Combine additional rules and test functionality
  describe("combineRules with multiple rules - Complex scenarios", () => {
    test("should handle multiple rules and evaluate them correctly", () => {
      const rule1 = createRule("age > 30");
      const rule2 = createRule("salary < 5000");
      const rule3 = createRule("spend > 2000");

      const combinedAST = combineRules([rule1, rule2, rule3], "AND");
      const data = { age: 32, salary: 4500, spend: 2500 };

      const result = evaluateRule(combinedAST, data);

      expect(result.success).toBe(true);
      expect(result.message).toBe("Both conditions passed for AND");
    });
  });
});
