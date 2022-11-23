const vscode = require("vscode");
const fs = require("fs");
const workspace = vscode.workspace;
const window = vscode.window;
const eventCollection = {};

function getStatusBar() {
  const configuration = workspace.getConfiguration("file-size");
  eventCollection.statusBar = window.createStatusBarItem(
    configuration.get("position") === "left"
      ? vscode.StatusBarAlignment.Left
      : vscode.StatusBarAlignment.Right,
    configuration.get("priority")
  );
  eventCollection.statusBar.show();
}

/**
 * @param {Date} lmdate filesize
 */
function sizeConvert(lmdate, mtimeS) {
  let seconds = (new Date().getTime() - mtimeS) / 1000
  console.log(new Date().getTime());
  console.log(mtimeS);
  console.log(seconds);
  let month = lmdate.getMonth();
  let day = lmdate.getDate();
  let year = lmdate.getFullYear();
  let hr = lmdate.getHours();
  let min = lmdate.getMinutes();
  let sec = lmdate.getSeconds();

  let dn = ""
  if (hr>12){
    dn = "PM"
  }
  else{
    dn = "AM"
  }



  return `Last Modified on ${month}/${day}/${year} at ${hr}:${min}:${sec} ${dn}`;
}

/**
 * @param {import('vscode').TextDocument} doc
 */
function updateSize(doc) {
  const lastModified = fs.statSync(doc.fileName).mtime;
  const timeInSec = fs.statSync(doc.fileName).mtimeMs;
  const sizeMan = sizeConvert(lastModified, timeInSec);
  eventCollection.statusBar.text = sizeMan;
}

function activate() {
  getStatusBar();
  const activeTextEditor = window.activeTextEditor;
  activeTextEditor && updateSize(activeTextEditor.document);
  eventCollection.saveTextDocument = workspace.onDidSaveTextDocument((doc) => {
    const activeTextEditor = window.activeTextEditor;
    if (
      activeTextEditor &&
      activeTextEditor.document.fileName === doc.fileName
    ) {
      updateSize(activeTextEditor.document);
    }
  });
  eventCollection.changeActiveTextEditor = window.onDidChangeActiveTextEditor(
    (textEditor) => {
      if (textEditor) {
        updateSize(textEditor.document);
      } else {
        eventCollection.statusBar.text = "";
      }
    }
  );
  eventCollection.changeConfiguration = workspace.onDidChangeConfiguration(
    () => {
      eventCollection.statusBar.dispose();
      getStatusBar();
      const activeTextEditor = window.activeTextEditor;
      activeTextEditor && updateSize(activeTextEditor.document);
    }
  );
}

exports.activate = activate;

function deactivate() {
  eventCollection.saveTextDocument &&
    eventCollection.saveTextDocument.dispose();
  eventCollection.changeActiveTextEditor &&
    eventCollection.changeActiveTextEditor.dispose();
  eventCollection.changeConfiguration &&
    eventCollection.changeConfiguration.dispose();
  eventCollection.statusBar.dispose();
}

module.exports = {
  activate,
  deactivate,
};
