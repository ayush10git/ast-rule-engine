import { useState } from "react";
import "./App.css";
import axios from "axios";
import { convertResponseToEvaluationFormat } from "./utils/convert";

function App() {
  const [ruleString, setRuleString] = useState("");
  const [age, setAge] = useState("");
  const [salary, setSalary] = useState("");
  const [department, setDepartment] = useState(""); 
  const [data, setData] = useState(null);
  const [message, setMessage] = useState("");
  const [evaluationResult, setEvaluationResult] = useState(null);

  const createRule = async () => {
    try {
      const res = await axios.post("http://localhost:5050/ruleEng/create", {
        rule_string: ruleString,
      });

      if (res && res.data) {
        const formattedData = convertResponseToEvaluationFormat(res.data, {
          age: parseInt(age, 10),
          salary: parseInt(salary, 10),
          department,
        });
        setData(formattedData);

        const response = await axios.post(
          "http://localhost:5050/ruleEng/evaluate",
          formattedData
        );

        if (response && response.data) {
          console.log(response.data);
          setEvaluationResult(response.data.success);
          setMessage(response.data.message); 
        } else {
          setMessage("Evaluation failed: No response data.");
        }
      }
    } catch (error) {
      console.error(error.response.data.message);
      if (error.response.data.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage("Failed to create rule or evaluate it. Please check the rule syntax. \n Only '>', '<', '=', 'AND' and 'OR' operators are allowed. ")
      }

      setData(null);
      setEvaluationResult(false);
    }
  };

  return (
    <div className="app">
      <h2 className="heading">Rule Engine</h2>
      <div>
        <label>Enter Rule String: </label>
        <input
          type="text"
          className="input"
          value={ruleString}
          onChange={(e) => setRuleString(e.target.value)}
          placeholder="(age > 30 AND salary < 50000) OR department = Engineering"
          required
        />
      </div>

      <div>
        <label>Enter Age: </label>
        <input
          type="number"
          className="input"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="Age"
          required
        />
      </div>

      <div>
        <label>Enter Salary: </label>
        <input
          type="number"
          className="input"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
          placeholder="Salary"
          required
        />
      </div>

      <div>
        <label>Enter Department: </label>
        <input
          type="text"
          className="input"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          placeholder="Department"
          required
        />
      </div>

      <button onClick={createRule}>Check</button>

      {message && (
        <p style={{ color: evaluationResult === false ? "red" : "green" }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default App;
