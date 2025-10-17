import { generateText } from "ai";
import "dotenv/config";

export async function summarizeProject(
  projectName: string,
  columns: any[],
  tasks: any[]
): Promise<string> {
  try {
    const tasksByColumn = columns.map((column) => ({
      columnName: column.name,
      tasks: tasks.filter((task) => task.column_id === column._id.toString()),
    }));

    const prompt = `
        Please provide a concise summary of the project "${projectName}" based on the following task data:
        
        ${tasksByColumn
          .map(
            (col) => `
        ${col.columnName} (${col.tasks.length} tasks):
        ${col.tasks
          .map(
            (task) => `- ${task.title}: ${task.description || "No description"}`
          )
          .join("\n")}
        `
          )
          .join("\n")}
        
        Please provide:
        1. Overall project status and progress
        2. Key tasks and priorities
        3. Any potential blockers or issues
        4. Recommendations for next steps
        
        Keep the summary concise but informative (2-3 paragraphs max).
      `;

    const result = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: prompt,
    });
    return result.text;
  } catch (error) {
    console.error("Error generating project summary:", error);
    throw new Error("Failed to generate project summary");
  }
}

export async function answerQuestion(
  projectName: string,
  columns: any[],
  tasks: any[],
  question: string
): Promise<string> {
  try {
    const tasksByColumn = columns.map((column) => ({
      columnName: column.name,
      tasks: tasks.filter((task) => task.column_id === column._id.toString()),
    }));
    console.log(tasksByColumn);
    const prompt = `
        You are an AI assistant helping with project management for "${projectName}". 
        Based on the following project data, please answer the user's question.
        
        Project Data:
        ${tasksByColumn
          .map(
            (col) => `
        ${col.columnName} (${col.tasks.length} tasks):
        ${col.tasks
          .map(
            (task) => `- ${task.title}: ${task.description || "No description"}`
          )
          .join("\n")}
        `
          )
          .join("\n")}
        
        User Question: ${question}
        
        Please provide a helpful, accurate answer based on the project data. If the question cannot be answered with the available information, please say so and suggest what additional information might be needed.
      `;

    const result = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: prompt,
    });
    return result.text;
  } catch (error) {
    console.error("Error answering question:", error);
    throw new Error("Failed to answer question");
  }
}

(async () => {
  try {
    console.log(
      await answerQuestion("Test Project", [], [], "What is the project?")
    );
  } catch (error) {
    console.error("Error:", error);
  }
})();
