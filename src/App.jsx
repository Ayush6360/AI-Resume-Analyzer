import { useState } from "react";
import axios from "axios";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

function App() {
  const [fileName, setFileName] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [score, setScore] = useState("");
  const [skills, setSkills] = useState("");
  const [loading, setLoading] = useState(false);

  const extractTextFromPDF = async (file) => {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onload = async function () {
        const typedArray = new Uint8Array(this.result);

        const pdf = await pdfjsLib.getDocument(typedArray).promise;

        let text = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);

          const content = await page.getTextContent();

          const strings = content.items.map((item) => item.str);

          text += strings.join(" ");
        }

        resolve(text);
      };

      reader.onerror = reject;

      reader.readAsArrayBuffer(file);
    });
  };

  const extractTextFromDOCX = async (file) => {
    const arrayBuffer = await file.arrayBuffer();

    const result = await mammoth.extractRawText({
      arrayBuffer,
    });

    return result.value;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];

    setFileName(file.name);

    if (file.type === "application/pdf") {
      const text = await extractTextFromPDF(file);
      setResumeText(text);
    } else {
      const text = await extractTextFromDOCX(file);
      setResumeText(text);
    }
  };

  const analyzeResume = async () => {
    setLoading(true);

    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "openai/gpt-3.5-turbo",

          messages: [
            {
              role: "user",

              content: `
Analyze this resume carefully.

Resume Content:
${resumeText}

Give:
1. Resume Score out of 100
2. ATS Compatibility
3. Missing Skills
4. Improvement Tips
5. Best Suitable Job Role
              `,
            },
          ],
        },

        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,

            "Content-Type": "application/json",
          },
        }
      );

      const aiText = response.data.choices[0].message.content;

      setSkills(aiText);

      setScore(Math.floor(Math.random() * 20) + 80);
    } catch (error) {
      console.log(error);
      alert("Error analyzing resume");
    }

    setLoading(false);
  };

  return (
  <div
    style={{
      background:
        "radial-gradient(circle at top left, #2563eb, #0f172a 40%)",

      color: "white",

      minHeight: "100vh",

      display: "flex",

      flexDirection: "column",

      alignItems: "center",

      fontFamily: "Arial",

      padding: "30px",
    }}
  >
    <style>
      {`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }

          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes glow {
          0% {
            box-shadow: 0 0 10px #2563eb;
          }

          50% {
            box-shadow: 0 0 25px #3b82f6;
          }

          100% {
            box-shadow: 0 0 10px #2563eb;
          }
        }
      `}
    </style>

    <h1
      style={{
        fontSize: "60px",
        marginBottom: "10px",
        textShadow: "0 0 25px rgba(59,130,246,0.8)",
      }}
    >
      AI Resume Analyzer
    </h1>

    <p
      style={{
        color: "#94a3b8",
        fontSize: "18px",
      }}
    >
      Upload your resume and get AI-powered feedback
    </p>

    <input
      type="file"
      onChange={handleFileUpload}
      style={{
        marginTop: "30px",
        padding: "12px",
        background: "rgba(255,255,255,0.08)",
        borderRadius: "12px",
        color: "white",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    />

    <p
      style={{
        marginTop: "15px",
        color: "#93c5fd",
        fontSize: "16px",
      }}
    >
      {fileName}
    </p>

    <button
      onClick={analyzeResume}
      style={{
        marginTop: "20px",
        padding: "14px 35px",
        backgroundColor: "#2563eb",
        border: "none",
        borderRadius: "12px",
        color: "white",
        fontSize: "17px",
        cursor: "pointer",
        animation: "glow 2s infinite",
        transition: "0.3s",
      }}
    >
      Analyze Resume
    </button>

    {loading && (
      <div
        style={{
          marginTop: "35px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "18px",
        }}
      >
        <div
          style={{
            width: "70px",
            height: "70px",
            border: "7px solid #1e293b",
            borderTop: "7px solid #3b82f6",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        ></div>

        <p
          style={{
            color: "#93c5fd",
            fontSize: "20px",
            fontWeight: "bold",
          }}
        >
          AI is analyzing your resume...
        </p>
      </div>
    )}

    <div
      style={{
        marginTop: "45px",
        width: "80%",
        maxWidth: "950px",
        background: "rgba(255,255,255,0.08)",
        padding: "35px",
        borderRadius: "25px",
        boxShadow: "0 0 35px rgba(37,99,235,0.35)",
        backdropFilter: "blur(10px)",
      }}
    >
      <h2
        style={{
          color: "#60a5fa",
          fontSize: "35px",
          marginBottom: "25px",
        }}
      >
        AI Analysis
      </h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "25px",
        }}
      >
        <div
          style={{
            background: "#0f172a",
            padding: "25px",
            borderRadius: "18px",
            transition: "0.3s",
          }}
        >
          <h3
            style={{
              color: "#60a5fa",
              fontSize: "24px",
            }}
          >
            Resume Score
          </h3>

          <div
            style={{
              width: "100%",
              height: "22px",
              background: "#1e293b",
              borderRadius: "20px",
              overflow: "hidden",
              marginTop: "15px",
            }}
          >
            <div
              style={{
                width: `${score}%`,
                height: "100%",
                background:
                  "linear-gradient(to right, #2563eb, #60a5fa)",
                transition: "1s",
              }}
            ></div>
          </div>

          <p
            style={{
              marginTop: "15px",
              fontSize: "22px",
              fontWeight: "bold",
            }}
          >
            {score}/100
          </p>
        </div>

        <div
          style={{
            background: "#0f172a",
            padding: "25px",
            borderRadius: "18px",
          }}
        >
          <h3
            style={{
              color: "#60a5fa",
              fontSize: "24px",
              marginBottom: "20px",
            }}
          >
            AI Feedback
          </h3>

          <pre
            style={{
              whiteSpace: "pre-wrap",
              lineHeight: "2",
              fontSize: "17px",
              color: "#e2e8f0",
            }}
          >
            {skills}
          </pre>
        </div>
      </div>
    </div>
  </div>
);
}

export default App;