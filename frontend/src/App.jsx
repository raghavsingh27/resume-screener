import { useState } from "react"

function App() {

  const [pdfFile, setPdfFile] = useState(null)
  const [jobDescription, setJobDescription] = useState("")
  const [result, setResult] = useState(null)
  // loading state shows spinner while waiting for AI response
  const [loading, setLoading] = useState(false)

  function handleFileChange(e) {
    setPdfFile(e.target.files[0])
  }

  // This function sends data to our backend
  async function handleSubmit() {
    if (!pdfFile || !jobDescription) {
      alert("Please upload a resume and enter a job description!")
      return
    }

    // Show loading spinner
    setLoading(true)
    setResult(null)

    // FormData is used to send files + text together
    const formData = new FormData()
    formData.append("pdf", pdfFile)
    formData.append("job_description", jobDescription)

    try {
      // Send to our FastAPI backend
      const response = await fetch("https://resume-screener-backend-f8zj.onrender.com/analyse", { 
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      // Save the result to show on screen
      setResult(data.result)

    } catch (error) {
      alert("Something went wrong! Make sure backend is running.")
    }

    // Hide loading spinner
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">

      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-xl">

        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-2">
          Resume Screener
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Upload your resume and paste a job description to get an AI score
        </p>

        {/* PDF Upload */}
        <label className="block text-gray-700 font-semibold mb-1">
          Upload Resume (PDF)
        </label>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="w-full border border-gray-300 rounded-lg p-2 mb-4"
        />

        {/* Show file name after upload */}
        {pdfFile && (
          <p className="text-green-600 text-sm mb-4">
            ✅ {pdfFile.name} selected
          </p>
        )}

        {/* Job Description Box */}
        <label className="block text-gray-700 font-semibold mb-1">
          Paste Job Description
        </label>
        <textarea
          rows={5}
          placeholder="Paste the job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 mb-4 resize-none"
        />

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Analysing... Please wait" : "Analyse Resume"}
        </button>

        {/* Result Area */}
        {result && (
          <div className="mt-6 bg-gray-50 rounded-xl p-4">
            <h2 className="text-xl font-bold text-gray-800 mb-3">
              Analysis Result
            </h2>
            {/* Split result by new lines and show each line */}
            {result.split("\n").map((line, index) => (
              <p key={index} className="text-gray-700 mb-1">
                {line}
              </p>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default App