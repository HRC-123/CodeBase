import { useEffect, useRef, useState } from "react";
import { Editor } from "@monaco-editor/react";
import DropDown from "./DropDown";
import { CODE_SNIPPETS } from "../Utils/languages";
import { BiCodeAlt } from "react-icons/bi";
import Submit from "./Submit";
import Fullscreen from "./FullScreen";
import ToolBar from "./ToolBar";
import Folder from "./Folder";
import History from "./History";
import { AiOutlineSun, AiOutlineMoon } from "react-icons/ai";
import toast from "react-hot-toast";
import { restrictedPatterns } from "../Utils/restrictedtext";
import { IoIosMenu } from "react-icons/io";

const CodeEditor = (props) => {
  const editorRef = useRef();

  const [selected, setSelected] = useState(0);
  const [settingsopen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [wordWrap, setWordWrap] = useState(false);
  const [fontSize, setFontSize] = useState(16);

  useEffect(() => {
    props.setLanguage("Choose_Language");
    props.setValue(CODE_SNIPPETS["Choose_Language"]);
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ wordWrap: wordWrap ? "on" : "off" });
    }
  }, [wordWrap]);

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();

    editor.onDidChangeModelContent((event) => {
      const value = editor.getValue();
      const changes = event.changes.map((change) => ({
        range: change.range,
        rangeLength: change.rangeLength,
        text: change.text,
      }));

      // Check for restricted patterns
      for (let pattern of restrictedPatterns) {
        if (pattern.test(value)) {
          // Remove the restricted text by restoring the previous value
          editor.executeEdits("", [
            {
              range: editor.getModel().getFullModelRange(),
              text: value.replace(pattern, ""),
            },
          ]);
          return; // Exit after handling the restricted pattern
        }
      }

      // If no restricted pattern is found, update delta changes
      console.log("Editor changes detected:", changes);
      props.updateDeltaChanges(changes);
    });
  };

  const onSelect = (language) => {
    if (props.value === CODE_SNIPPETS[props.language]) {
      props.setValue(CODE_SNIPPETS[language]);
    }

    props.setLanguage(language);
    console.log(language);
  };

  const setToolbarNull = () => {
    setSelected(0);
    props.setFolderOpen(false);
    props.setOpenNewFile(false);
    props.setOpenExtraNewFile(false);
    setSettingsOpen(false);
    props.setShareOpen(false);
    props.setInfoOpen(false);
  };

  const formatCode = () => {
    editorRef.current.getAction("editor.action.formatDocument").run();
    toast.success("Code Formatted", { duration: 800 });
  };

  const handleToolBar = () => {
    props.setToolBar(!props.toolBar);
    setToolbarNull();
  };

  const [editorWidth, setEditorWidth] = useState("100%");

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640 && props.toolBar === true) {
        // Tailwind's 'sm' breakpoint is 640px
        setEditorWidth("87%");
      } else {
        setEditorWidth("100%");
      }
    };

    window.addEventListener("resize", handleResize);

    // Initial check
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });

  return (
    <div className={`h-full w-full flex flex-col `}>
      <div className="flex justify-between  items-center w-full  h-20 p-2">
        <div className="cursor-pointer sm:flex gap-2  ">
          {props.toolBar === true ? (
            <img
              src="./Icons/Close.png"
              alt="Close"
              className="h-[32px] w-[32px] hidden sm:block"
              onClick={() => {
                handleToolBar();
              }}
            />
          ) : (
            <img
              src="./Icons/More.png"
              alt="More"
              className="h-[32px] w-[32px] hidden sm:block"
              onClick={() => {
                handleToolBar();
              }}
            />
          )}

          <IoIosMenu
            size={36}
            onClick={() => {
              handleToolBar();
            }}
            className="block sm:hidden"
          />

          {props.fileIndex !== -1 || props.extraFileIndex !== -1 ? (
            <DropDown
              language={props.language}
              onSelect={onSelect}
              lightmode={props.lightmode}
            />
          ) : (
            ""
          )}
        </div>

        <div className=" flex gap-2 h-10 items-center sm:gap-4">
          <button
            className="h-10 w-10  sm:flex items-center justify-center bg-blue-500 text-white rounded-full focus:outline-none focus:bg-blue-600 hidden "
            onClick={formatCode}
          >
            <BiCodeAlt className="text-xl" />
          </button>
          <div
            className={` cursor-pointer w-10 h-[94%] ${
              props.lightmode
                ? "text-black bg-white border-black"
                : "text-white bg-[#1e1e1e] border-white"
            }   rounded border `}
          >
            <Fullscreen />
          </div>
          <div
            className=" cursor-pointer font-semibold h-full w-10 "
            onClick={() => props.handleLight()}
          >
            {props.lightmode === true ? (
              <div className="text-white h-full w-full bg-[#1e1e1e]  flex justify-center items-center rounded border border-white">
                <AiOutlineMoon className="h-6 w-6" />
              </div>
            ) : (
              <div className="text-black  bg-white h-full w-full flex justify-center items-center  rounded border border-black">
                <AiOutlineSun className="h-6 w-6" />
              </div>
            )}
          </div>

          <Submit lightmode={props.lightmode} />
        </div>
      </div>

      <div
        className={`flex h-full w-full ${
          props.lightmode ? "" : "bg-[#1e1e1e]"
        } `}
      >
        <div className="w-auto">
          <ToolBar
            folderfiles={props.folderfiles}
            setFolderFiles={props.setFolderFiles}
            folderopen={props.folderopen}
            setFolderOpen={props.setFolderOpen}
            value={props.value}
            setValue={props.setValue}
            updateChangeCode={props.updateChangeCode}
            zipAndDownload={props.zipAndDownload}
            handleFileUpload={props.handleFileUpload}
            lightmode={props.lightmode}
            setLightMode={props.setLightMode}
            handleLight={props.handleLight}
            shareOpen={props.shareOpen}
            setShareOpen={props.setShareOpen}
            infoOpen={props.infoOpen}
            setInfoOpen={props.setInfoOpen}
            formatCode={formatCode}
            toolBar={props.toolBar}
            setToolBar={props.setToolBar}
            folderIndex={props.folderIndex}
            setFolderIndex={props.setFolderIndex}
            fileIndex={props.fileIndex}
            setFileIndex={props.setFileIndex}
            extraFileIndex={props.extraFileIndex}
            setExtraFileIndex={props.setExtraFileIndex}
            newFileName={props.newFileName}
            setNewFileName={props.setNewFileName}
            opennewfile={props.opennewfile}
            setOpenNewFile={props.setOpenNewFile}
            openExtraNewFile={props.openExtraNewFile}
            setOpenExtraNewFile={props.setOpenExtraNewFile}
            selected={selected}
            setSelected={setSelected}
            settingsopen={settingsopen}
            setSettingsOpen={setSettingsOpen}
            historyOpen={historyOpen}
            setHistoryOpen={setHistoryOpen}
            language={props.language}
            setLanguage={props.setLanguage}
            wordWrap={wordWrap}
            setWordWrap={setWordWrap}
            keyboardShortcut={props.keyboardShortcut}
            setKeyboardShortcut={props.setKeyboardShortcut}
            fontSize={fontSize}
            setFontSize={setFontSize}
            email={props.email}
            setEmail={props.setEmail}
            fileChecked={props.fileChecked}
            outputChecked={props.outputChecked}
            setFileChecked={props.setFileChecked}
            setOutputChecked={props.setOutputChecked}
            testCases={props.testCases}
            setTestCases={props.setTestCases}
            initialTestCases={props.initialTestCases}
          />
        </div>
        <div className="h-full">
          {props.folderopen === true ? (
            <div
              className={`absolute z-10 left-12 w-36 sm:h-[80vh] sm:w-48 h-[55vh] ${
                props.lightmode ? "bg-gray-100" : "bg-[#1e1e1e]"
              }`}
            >
              <Folder
                folderfiles={props.folderfiles}
                setFolderFiles={props.setFolderFiles}
                opennewfolder={props.opennewfolder}
                setOpenNewFolder={props.setOpenNewFolder}
                value={props.value}
                setValue={props.setValue}
                folderIndex={props.folderIndex}
                setFolderIndex={props.setFolderIndex}
                fileIndex={props.fileIndex}
                setFileIndex={props.setFileIndex}
                language={props.language}
                setLanguage={props.setLanguage}
                extraFileIndex={props.extraFileIndex}
                setExtraFileIndex={props.setExtraFileIndex}
                newFileName={props.newFileName}
                setNewFileName={props.setNewFileName}
                opennewfile={props.opennewfile}
                setOpenNewFile={props.setOpenNewFile}
                openExtraNewFile={props.openExtraNewFile}
                setOpenExtraNewFile={props.setOpenExtraNewFile}
                extraNewFileName={props.extraNewFileName}
                setExtraNewFileName={props.setExtraNewFileName}
                newFolderName={props.newFolderName}
                handleFolderName={props.handleFolderName}
                addNewFolder={props.addNewFolder}
                lightmode={props.lightmode}
                setNewFolderName={props.setNewFolderName}
                outputFile={props.outputFile}
                setOutputFile={props.setOutputFile}
                initialOutput={props.initialOutput}
                testCases={props.testCases}
                setTestCases={props.setTestCases}
                initialTestCases={props.initialTestCases}
              />
            </div>
          ) : (
            ""
          )}
        </div>

        <div className="h-full">
          {historyOpen === true ? (
            <div
              className={`absolute z-10 left-12 w-36 sm:h-[80vh] sm:w-48 h-[55vh]  ${
                props.lightmode
                  ? "bg-gray-100 text-black"
                  : "bg-[#1e1e1e] text-white"
              }`}
            >
              <History />
            </div>
          ) : (
            ""
          )}
        </div>

        <Editor
          options={{
            minimap: {
              enabled: true,
            },
            wordWrap: wordWrap ? "on" : "off",
            fontSize: fontSize,
            lineNumbers: "on",
          }}
          height="100%"
          width={editorWidth}
          theme={props.lightmode ? "light" : "vs-dark"}
          language={props.language}
          defaultValue={CODE_SNIPPETS[props.language]}
          onMount={onMount}
          value={props.value}
          onChange={(value) => {
            props.setValue(value);
            props.setBoilerPlateCode(false);
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
