import { generateText } from "ai";
import "dotenv/config";

export async function summarizeProject(
  projectName: string,
  columns: any[],
  tasks: any[]
): Promise<string> {
  try {
    const toIdString = (id: any) =>
      typeof id === "string" ? id : id?.toString?.() ?? String(id);

    const tasksByColumn = columns.map((column) => ({
      columnName: column.name,
      columnId: toIdString(column._id),
      tasks: tasks.filter(
        (task) => toIdString(task.column_id) === toIdString(column._id)
      ),
    }));

    const doneColumns = columns.filter(
      (c) => String(c.name).trim().toLowerCase() === "done"
    );
    const doneColumnIds = new Set(doneColumns.map((c) => toIdString(c._id)));
    const doneTasks = tasks.filter((t) =>
      doneColumnIds.has(toIdString(t.column_id))
    );

    const prompt = `
        Provide a very brief project summary for "${projectName}" based on the data below.
        
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
        
        Completed (Done) tasks (${doneTasks.length}):
        ${doneTasks.map((t) => `- ${t.title}`).join("\n") || "- None"}
        
        Output format:
        - Overall project status and progress
        - 3–6 short bullet points
        - Plain text only, no intro/outro
        - Max 80 words total
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
    const toIdString = (id: any) =>
      typeof id === "string" ? id : id?.toString?.() ?? String(id);

    const tasksByColumn = columns.map((column) => ({
      columnName: column.name,
      columnId: toIdString(column._id),
      tasks: tasks.filter(
        (task) => toIdString(task.column_id) === toIdString(column._id)
      ),
    }));
    console.log(tasksByColumn);

    const doneColumns = columns.filter(
      (c) => String(c.name).trim().toLowerCase() === "done"
    );
    const doneColumnIds = new Set(doneColumns.map((c) => toIdString(c._id)));
    const doneTasks = tasks.filter((t) =>
      doneColumnIds.has(toIdString(t.column_id))
    );

    const prompt = `
        You help with project management for "${projectName}".
        Answer the user's question using the data below. Be brief.
        
        Quick facts:
        - Completed (Done) tasks: ${doneTasks.length}
        ${
          doneTasks
            .map((t) => `- ${t.title}: ${t.description || "No description"}`)
            .join("\n") || "- None"
        }

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
        
        Output constraints:
        - 1–3 short sentences OR 3–5 bullets
        - Answer directly; no preamble
        - If unknown, say "Not enough info" and suggest 1 next step
        - Max 60 words
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
