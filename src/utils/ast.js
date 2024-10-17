class Node {
  constructor(type, left = null, right = null, value = null) {
    this.type = type; 
    this.left = left;
    this.right = right;
    this.value = value; 
  }
}

function precedence(operator) {
  if (operator === "AND") {
    return 2;
  } else if (operator === "OR") {
    return 1;
  } else {
    return 0;
  }
}

function createRule(ruleString) {
  const operators = ["AND", "OR"];
  const regex = /\s*(\(|\)|AND|OR)\s*/g;

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
      const parts = token.match(/(\w+)\s*(>|<|=)\s*(['"][^'"]+['"]|\w+)/);

      if (parts) {
        const attribute = parts[1];
        const operator = parts[2];
        let value = parts[3].replace(/['"]/g, ""); 

        value = isNaN(value) ? value : Number(value);

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

  while (stack.length) {
    output.push(stack.pop());
  }

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

  return astStack.length === 1 ? astStack[0] : null;
}

function combineRules(rules) {
  if (!rules.length) return null;

  let root = rules[0];
  for (let i = 1; i < rules.length; i++) {
    root = new Node("operator", root, rules[i], "AND");
  }

  return root;
}

function evaluateRule(ast, data) {
    if (ast.type === "operand") {
      const { attribute, operator, value } = ast.value;
      let conditionMet = false;
  
      if (operator === ">") conditionMet = data[attribute] > value;
      if (operator === "<") conditionMet = data[attribute] < value;
      if (operator === "=") conditionMet = data[attribute] === value;
  
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
          return leftResult;
        }
        if (!rightResult.success) {
          return rightResult;
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

function modifyRuleOperand(ast, attribute, newValue) {
  if (ast && ast.type === "operand" && ast.value.attribute === attribute) {
    ast.value.value = newValue;
  }
  if (ast && ast.left) modifyRuleOperand(ast.left, attribute, newValue);
  if (ast && ast.right) modifyRuleOperand(ast.right, attribute, newValue);
  return ast;
}

export {
  Node,
  createRule,
  combineRules,
  evaluateRule,
  validateRuleString,
  modifyRuleOperator,
  modifyRuleOperand,
};
