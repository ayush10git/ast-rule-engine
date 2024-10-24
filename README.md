# AST Rule Engine

The Rule Engine API is a backend system that allows for creating, modifying, evaluating, and combining rules based on Abstract Syntax Trees (AST). The API supports dynamic rule manipulation using logical operators and operands.

#Setting Up the Backend - Node.js

## Installation

Ensure you have Node.js and MongoDB installed before starting.
1. Clone the repository:

```bash
git clone https://github.com/your-repo/rule-engine.git
cd rule-engine
```

2. Install the required dependencies:

```bash
npm install
```

3. Create a .env file at the root of the project and add the following variables:
   You can use my mongodb which I use for testing
```bash
MONGO_URI=mongodb+srv://ayushg31:ayush123@ayushcluster.slpkxto.mongodb.net
PORT=5000
```
Replace MONGO_URI with your MongoDB connection string if different, and adjust PORT as necessary.

## Running the App
To start the app in development mode, use:
```bash
npm run dev
```

By default, the server will run on http://localhost:5000 (or the port you specified in your .env file).

## Dependencies
The following are the key dependencies for the project:

express: Minimalist web framework for Node.js.

mongoose: MongoDB object modeling for Node.js.

dotenv: Loads environment variables from a .env file.

nodemon: Restarts the server when file changes are detected (for development).

asyncHandler: Utility for handling async operations in express routes.

custom utils: Utilities for handling AST manipulations and API responses (ApiError, ApiResponse, etc.).

You can install all dependencies using:
```bash
npm install
```

## API Endpoints

1. Create Rule

   POST /ruleEng/create

   Creates a new rule by converting the provided rule string into an AST.

   Request:
   ```json
   {
     "rule_string": "(age > 30 AND salary < 50000) OR department = 'Engineering'"
   }
   ```
   Response:
   ```json
   {
       "statusCode": 201,
       "data": {
           "rule_name": "department = 'Engineering'",
           "ast": {
               "type": "operand",
               "value": {
                   "attribute": "department",
                   "operator": "=",
                   "value": "Engineering"
               },
               "left": null,
               "right": null,
               "_id": "6710f9cb8f0f00a7099f3451"
           },
           "_id": "6710f9cb8f0f00a7099f3450",
           "created_at": "2024-10-17T11:49:31.473Z",
           "updated_at": "2024-10-17T11:49:31.474Z",
           "__v": 0
       },
       "message": "Rule Created Successfully",
       "success": true
   }
   ```

2. Combine Rules

   POST /ruleEng/combine

   Combines multiple rules into one using logical operators like AND or OR.

   Request:
   ```json
   {
     "rules": [
     "age > 30",
     "salary < 50000",
     "department = 'Engineering'"
    ],
    "operators": ["AND", "OR"]
   }
   ```
   Response:
   ```json
   {
    "statusCode": 201,
    "data": {
        "rule_name": "age > 26 AND OR salary < 60000 AND OR department = 'Marketing'",
        "ast": {
            "type": "operator",
            "value": "AND",
            "left": {
                "type": "operator",
                "left": {
                    "type": "operand",
                    "left": null,
                    "right": null,
                    "value": {
                        "attribute": "age",
                        "operator": ">",
                        "value": 26
                    }
                },
                "right": {
                    "type": "operand",
                    "left": null,
                    "right": null,
                    "value": {
                        "attribute": "salary",
                        "operator": "<",
                        "value": 60000
                    }
                },
                "value": "AND"
            },
            "right": {
                "type": "operand",
                "left": null,
                "right": null,
                "value": {
                    "attribute": "department",
                    "operator": "=",
                    "value": "Marketing"
                }
            },
            "_id": "67114bb88480f64ec7daa6f2"
        },
        "_id": "67114bb88480f64ec7daa6f1",
        "created_at": "2024-10-17T17:39:04.348Z",
        "updated_at": "2024-10-17T17:39:04.348Z",
        "__v": 0
    },
    "message": "Rules combined and saved successfully",
    "success": true
   }
   ```

3. Evaluate Rule

   POST /ruleEng/evaluate

   Evaluates a rule using the provided AST and data for evaluation.

   Request:
   ```json
   {
      "ast": {
      "type": "operator",
      "value": "AND",
      "left": {
         "type": "operand",
         "value": {
         "attribute": "age",
         "operator": ">",
         "value": 30
       }
     },
     "right": {
        "type": "operand",
        "value": {
        "attribute": "salary",
        "operator": "<",
        "value": 50000
      }
     }
   },
   "data": {
     "age": 35,
     "salary": 45000
    }
   }
   ```
   Response:
   ```json
   {
    "success": true,
    "message": "Both conditions passed for AND"
   }
   ```

#To run tests
```bash
   npm test
   ```

## Note:
You can use tools like Postman

## Frontend - React.js

# Installation

Ensure you have Node.js and MongoDB installed before starting.
1. Clone the repository:

```bash
git clone https://github.com/ayush10git/ast-rule-engine/tree/frontend
```

2. Install the required dependencies:

```bash
npm install
```

## Running the App
To start the app in development mode, use:
```bash
npm start
```

# Note: Make sure the Backend is Running, while running the React App.

   
