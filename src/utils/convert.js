export function convertResponseToEvaluationFormat(response, data) {
  if (!response || !response.data || !response.data.ast) {
    throw new Error("Invalid response format: Missing AST data");
  }

  const { ast } = response.data;

  const evaluationFormat = {
    ast,
    data: {
      age: data.age,
      salary: data.salary,
      department: data.department 
    },
  };

  return evaluationFormat;
}
