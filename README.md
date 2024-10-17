Rule Engine API
This project is a backend API for creating, modifying, evaluating, and combining rules based on Abstract Syntax Trees (AST). The rules can be combined using logical operators, and the API allows dynamic modification of operands and operators within the rules.

Table of Contents
Installation
Running the App
Dependencies
API Endpoints
Create Rule
Combine Rules
Evaluate Rule
Modify Rule Operator
Modify Rule Operand


Installation
Before running the application, ensure that you have the following installed:

Node.js
MongoDB
Steps
Clone the repository:
bash
Copy code
git clone https://github.com/your-repo/rule-engine.git
cd rule-engine
Install the required dependencies:
bash
Copy code
npm install
Create a .env file at the root of the project and set the following environment variables:
bash
Copy code
MONGO_URI=mongodb://localhost:27017/rule-engine-db
PORT=5000
Replace the MONGO_URI with your MongoDB connection string if different, and adjust the PORT if needed.

Running the App
After installing the dependencies, you can run the application in development mode using:

bash
Copy code
npm run dev
This will start the server on the port specified in your .env file. By default, it will run on http://localhost:5000.

Dependencies
The following are the main dependencies used in the project:

express: Fast, unopinionated, minimalist web framework for Node.js.
mongoose: Elegant MongoDB object modeling for Node.js.
dotenv: Loads environment variables from a .env file into process.env.
nodemon: Automatically restarts the server when file changes are detected (used in development).
asyncHandler: Utility to handle asynchronous operations in express routes.
custom utils: ApiError, ApiResponse, and AST related utilities for error handling and AST manipulations.
You can install all dependencies with:

bash
Copy code
npm install
API Endpoints
Below are the available API endpoints, detailing how to use each controller and its function:

1. Create Rule
POST /api/rules/create

This endpoint creates a new rule by accepting a rule string and converting it into an AST.

Request Body:
json
Copy code
{
  "rule_string": "(age > 30 AND salary < 50000) OR department = 'Engineering'"
}
Response:
json
Copy code
{
  "status": 201,
  "data": {
    "rule_name": "(age > 30 AND salary < 50000) OR department = 'Engineering'",
    "ast": { /* abstract syntax tree */ }
  },
  "message": "Rule Created Successfully"
}
2. Combine Rules
POST /api/rules/combine

This endpoint combines multiple rules into one using logical operators such as AND or OR.

Request Body:
json
Copy code
{
  "rules": [
    "age > 30",
    "salary < 50000",
    "department = 'Engineering'"
  ],
  "operators": ["AND", "OR"]
}
Response:
json
Copy code
{
  "status": 201,
  "data": {
    "rule_name": "(age > 30 AND salary < 50000) OR department = 'Engineering'",
    "ast": { /* combined AST */ }
  },
  "message": "Rules combined and saved successfully"
}
3. Evaluate Rule
POST /api/rules/evaluate

This endpoint evaluates a rule by taking in a previously created AST and a data object that contains values for evaluation.

Request Body:
json
Copy code
{
  "ast": { /* AST object */ },
  "data": {
    "age": 35,
    "salary": 45000,
    "department": "Engineering"
  }
}
Response:
json
Copy code
{
  "status": 200,
  "success": true,
  "message": "Rule evaluated to true"
}
4. Modify Rule Operator
PUT /api/rules/modify-operator

This endpoint modifies the logical operator (AND/OR) in a previously created rule using the rule's ID.

Request Body:
json
Copy code
{
  "ruleId": "671100d781832b901896050f",
  "newOperator": "AND"
}
Response:
json
Copy code
{
  "status": 200,
  "data": { /* modified AST */ },
  "message": "Operator successfully modified to 'AND'"
}
5. Modify Rule Operand
PUT /api/rules/modify-operand

This endpoint modifies a specific operand in a rule by providing the rule's ID, the operand's attribute, and the new value.

Request Body:
json
Copy code
{
  "ruleId": "671100d781832b901896050f",
  "attribute": "age",
  "newValue": 40
}
Response:
json
Copy code
{
  "status": 200,
  "data": { /* modified AST */ },
  "message": "Operand for attribute 'age' successfully modified to '40'"
}
Notes
Ensure that MongoDB is running before starting the app, or the database connection will fail.
You can test the API endpoints using tools like Postman or cURL.
