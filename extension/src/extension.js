const vscode = require("vscode");
const fetch = require("node-fetch");

function activate(context) {
  let disposable = vscode.commands.registerCommand(
    "ai-js-debugger.debugFile",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No active file.");
        return;
      }

      const doc = editor.document;
      const code = doc.getText();
      const lang = doc.languageId; // 'javascript' or 'typescript'

      const res = await fetch("http://localhost:5000/debug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, lang })
      });

      const data = await res.json();

      if (data.status === "no_error") {
        vscode.window.showInformationMessage("✅ No runtime error found!");
        return;
      }

      if (data.status === "error_fixed") {
        const choice = await vscode.window.showInformationMessage(
          "AI found an error and suggests a fix. Apply?",
          "Apply Fix",
          "Show Diff"
        );

        if (choice === "Apply Fix") {
          const fullRange = new vscode.Range(
            doc.positionAt(0),
            doc.positionAt(code.length)
          );
          const edit = new vscode.WorkspaceEdit();
          edit.replace(doc.uri, fullRange, data.fixedCode);
          await vscode.workspace.applyEdit(edit);
          await doc.save();
          vscode.window.showInformationMessage("✅ Fix applied!");
        } else if (choice === "Show Diff") {
          const tempDoc = await vscode.workspace.openTextDocument({
            content: data.fixedCode,
            language: lang
          });
          vscode.window.showTextDocument(tempDoc, { preview: false });
        }
      }
    }
  );

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = { activate, deactivate };
