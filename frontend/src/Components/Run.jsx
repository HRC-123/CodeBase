import toast from "react-hot-toast";
import axios from "axios";
import { compiler } from "../service/api";
import { server } from "../service/api";
const FormData = require("form-data");

const Run = (props) => {
  //Sample output File
  const sampleOutput = {
    CompilationStatus: "Compilation Completed",
    ExecutionTime: "20",
    FilesCompiled: `File123123`,
    tc: [
      {
        input: { content: "Sample Input" },
        output: {
          error: false,
          errorCount: 0,
          warning: 0,
          errors: 0,
          content: "This is sample Output",
        },
      },
    ],
  };
  

const updateTestCases = (testCases, data) => {
  data.testcaseOutputs.forEach((testcaseOutput) => {
    const { outputContent } = testcaseOutput;
    if (testCases[props.testCaseSelected]) {
      testCases[props.testCaseSelected].output.content = outputContent;
    }
  });
  return testCases;
};

const setOutputFileWrapper = async (responseData) => {
  return new Promise(async (resolve) => {
    const updatedTestCases = updateTestCases(
      [...props.testCases],
      responseData.data
    );
    await props.setTestCases(updatedTestCases);
    resolve();
  });
};


  const updateChangeCodeWrapper = () => {
    return new Promise(async (resolve) => {
      console.log("Update Change code wrapper")
      await props.updateChangeCode();
      resolve();
    });
  };

  const onRun = async() => {
    console.log("Running");

    await updateChangeCodeWrapper();

   
    //Change into files
    

    toast.promise(updateChangeCodeWrapper(), {
      loading: "Saving...",
      success: <b>Save Successful!</b>,
      error: <b>Could not save</b>,
    });

    // POST Request with toast.promise
    //Get the details

    console.log("sending the data");

    const responseData = await props.sendTestCases(props.testCases, "run");

    console.log(responseData);



    

    
    
    const form = new FormData();
    form.append('response', responseData);
    form.append('folderIndex', props.folderIndex);
    form.append('fileIndex', props.fileIndex);
    form.append('testCaseSelected', props.testCaseSelected);
    console.log(form);

    console.log("Compiling");

    const compilerPromise = toast.promise(
      await axios.post(`${compiler}/initiate-compilation`, form),
      {
        loading: "Compiling...",
        success: (response) => {
          console.log("Compiled successfully:", response.data);
          return "Compiled successfully!";
        },
        error: (error) => {
          console.error("Error fetching output:", error);
          throw error;
        },
      }
    );

    const compilerResponse = await compilerPromise;
    console.log(compilerResponse);
  

    //Get the output
    console.log("Getting the output");


    const outputPromise = toast.promise(
      axios.get(
        `${server}/api/v1/file/testcase-outputs/${responseData.mainFileId}`
      ),
      {
        loading: "Getting output...",
        success: (response) => {
          console.log("Output fetched successfully:", response.data);
          return "Output fetched successfully!";
        },
        error: (error) => {
          console.error("Error fetching output:", error);
          throw error;
        },
      }
    );

    const responseOutput = await outputPromise;
    console.log(responseOutput);

    

    console.log("setting output");
    await setOutputFileWrapper(responseOutput);
    console.log("Output setup completed");


    await props.updateChangeOutput(responseOutput.data,props.testCaseSelected);
  };


  return (
    <button
      className={`  block w-20% px-4 py-1 text-center rounded ${
        props.lightmode ? "bg-custom-gradient " : "bg-custom-gradient-inverted "
      } text-white`}
      onClick={() => {
        onRun();
      }}
    >
      Run
    </button>
  );
};

export default Run;
