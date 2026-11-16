Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = scriptDir

nodePath = "node"
If fso.FileExists(WshShell.ExpandEnvironmentStrings("%ProgramFiles%\nodejs\node.exe")) Then
    nodePath = WshShell.ExpandEnvironmentStrings("%ProgramFiles%\nodejs\node.exe")
End If

WshShell.Run """" & nodePath & """ """ & scriptDir & "\auto-patcher.js""", 0, False
