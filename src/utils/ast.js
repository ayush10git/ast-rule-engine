class Node {
  constructor(type, left = null, right = null, value = null) {
    this.type = type; // "operator" or "operand"
    this.left = left;
    this.right = right;
    this.value = value; // for operand nodes, like { attribute: "age", operator: ">", value: 30 }
  }
}

function precedence(operator) {
  if (operator === "AND") {
    return 2; // Higher precedence
  } else if (operator === "OR") {
    return 1; // Lower precedence
  } else {
    return 0; // Default
  }
}

function createRule(ruleString) {
  const operators = ["AND", "OR"];
  const regex = /\s*(\(|\)|AND|OR)\s*/g; // Split on AND, OR, and parentheses

  // Split the ruleString by the regex and filter empty tokens
  const tokens = ruleString.split(regex).filter((token) => token.trim() !== "");

  const stack = [];
  const output = [];

  const isOperator = (token) => operators.includes(token);

  tokens.forEach((token) => {
    if (isOperator(token)) {
      while (
        stack.length &&
        precedence(stack[stack.length - 1]) >= precedence(token)
      ) {
        output.push(stack.pop());
      }
      stack.push(token);
    } else if (token === "(") {
      stack.push(token);
    } else if (token === ")") {
      while (stack.length && stack[stack.length - 1] !== "(") {
        output.push(stack.pop());
      }
      stack.pop(); // Remove the '('
    } else {
      // Handling "attribute operator value" format, accounting for quoted strings
      const parts = token.match(/(\w+)\s*(>|<|=)\s*(['"][^'"]+['"]|\w+)/);

      if (parts) {
        const attribute = parts[1];
        const operator = parts[2];
        let value = parts[3].replace(/['"]/g, ""); // Strip surrounding quotes if any

        // Convert to number if value is numeric, otherwise leave as string
        value = isNaN(value) ? value : Number(value);

        // Create an operand node
        output.push(
          new Node("operand", null, null, {
            attribute,
            operator,
            value,
          })
        );
      } else {
        console.error(`Invalid operand format: ${token}`);
        throw new Error(`Invalid operand format: ${token}`);
      }
    }
  });

  // Pop remaining operators from the stack
  while (stack.length) {
    output.push(stack.pop());
  }

  // Build the AST from output
  const astStack = [];
  output.forEach((token) => {
    if (typeof token === "string") {
      const right = astStack.pop();
      const left = astStack.pop();
      astStack.push(new Node("operator", left, right, token));
    } else {
      astStack.push(token);
    }
  });

  return astStack.length === 1 ? astStack[0] : null; // Return root node or null if invalid
}

// Combine rules by connecting them with an AND operator
function combineRules(rules) {
  if (!rules.length) return null;

  let root = rules[0];
  for (let i = 1; i < rules.length; i++) {
    root = new Node("operator", root, rules[i], "AND");
  }

  return root;
}

// Function to evaluate the AST against given data
function evaluateRule(ast, data) {
    if (ast.type === "operand") {
      const { attribute, operator, value } = ast.value;
      let conditionMet = false;
  
      // Evaluate the condition based on the operator
      if (operator === ">") conditionMet = data[attribute] > value;
      if (operator === "<") conditionMet = data[attribute] < value;
      if (operator === "=") conditionMet = data[attribute] === value;
  
      // If the condition is not met, return a detailed message
      if (!conditionMet) {
        return {
          success: false,
          message: `Condition failed: ${attribute} ${operator} ${value}`
        };
      }
      return {
        success: true,
        message: `Condition passed: ${attribute} ${operator} ${value}`
      };
    } else if (ast.type === "operator") {
      const leftResult = evaluateRule(ast.left, data);
      const rightResult = evaluateRule(ast.right, data);
  
      if (ast.value === "AND") {
        if (!leftResult.success) {
          return leftResult; // Return the detailed failure message for AND
        }
        if (!rightResult.success) {
          return rightResult; // Return the detailed failure message for AND
        }
        return {
          success: true,
          message: "Both conditions passed for AND"
        };
      }
  
      if (ast.value === "OR") {
        if (leftResult.success || rightResult.success) {
          return {
            success: true,
            message: "One condition passed for OR"
          };
        }
        return {
          success: false,
          message: "Both conditions failed for OR"
        };
      }
    }
    return {
      success: false,
      message: "Unknown error occurred during rule evaluation"
    };
  }
  

// Bonus: Validate rule string (syntax check or custom logic)
function validateRuleString(ruleString) {
  const validOperators = ["AND", "OR", ">", "<", "="];
  const validPattern = new RegExp(
    `\\s*\\w+\\s*(${validOperators.join("|")})\\s*(['"]?\\w+['"]?)`,
    "i"
  );

  const isBalanced = (str) => {
    const stack = [];
    for (const char of str) {
      if (char === "(") stack.push(char);
      if (char === ")") {
        if (!stack.length) return false;
        stack.pop();
      }
    }
    return stack.length === 0;
  };

  const isValidFormat = validPattern.test(ruleString);

  return isValidFormat && isBalanced(ruleString);
}

// Bonus: Modify the operator in a rule (AND/OR)
function modifyRuleOperator(ast, newOperator) {
  if (
    ast &&
    ast.type === "operator" &&
    (newOperator === "AND" || newOperator === "OR")
  ) {
    ast.value = newOperator;
  }
  return ast;
}

// Bonus: Modify operand values (e.g., change age or salary in the rule)
function modifyRuleOperand(ast, attribute, newValue) {
  if (ast && ast.type === "operand" && ast.value.attribute === attribute) {
    ast.value.value = newValue;
  }
  if (ast && ast.left) modifyRuleOperand(ast.left, attribute, newValue);
  if (ast && ast.right) modifyRuleOperand(ast.right, attribute, newValue);
  return ast;
}

// Ensure that we're exporting all the necessary functions and classes
export {
  Node,
  createRule,
  combineRules,
  evaluateRule,
  validateRuleString,
  modifyRuleOperator,
  modifyRuleOperand,
};
